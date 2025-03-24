// src/index.ts
import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import cors from 'cors';

// Convert callback-based functions to Promise-based
const execPromise = promisify(exec);
const readFilePromise = promisify(fs.readFile);
const mkdirPromise = promisify(fs.mkdir);

// Configuration
const PORT = process.env.PORT || 3000;
const TOOLS_DIR = path.join(__dirname, '../tools');

// Tool configurations
interface ToolConfig {
  name: string;
  inputDir: string;
  outputDir: string;
  dockerImage: string;
  resultFile: string;
  fallbackResultFile?: string;
  commandArgs?: (filename: string) => string;
  getResultPath: (outputDir: string, filename: string, resultFile: string) => string;
}

const tools: Record<string, ToolConfig> = {
  reconizex: {
    name: 'ReconizeX',
    inputDir: path.join(TOOLS_DIR, 'reconizex/input'),
    outputDir: path.join(TOOLS_DIR, 'reconizex/output'),
    dockerImage: 'devrvk/reconizerx-docker',
    resultFile: 'non-info.txt',
    fallbackResultFile: 'nuk.txt',
    commandArgs: (filename: string) => filename, 
    getResultPath: (outputDir, filename, resultFile) => {
      // For ReconizeX, output is in a subdirectory named after the APK (without .apk extension)
      const folderName = filename.replace('.apk', '');
      return path.join(outputDir, folderName, resultFile);
    }
  },
  secureapk: {
    name: 'SecureApk',
    inputDir: path.join(TOOLS_DIR, 'secureapk/input'),
    outputDir: path.join(TOOLS_DIR, 'secureapk/output'),
    dockerImage: 'devrvk/secureapk',
    resultFile: 'vulnerabilities.txt',
    // SecureApk doesn't need command args
    getResultPath: (outputDir, filename, resultFile) => {
      // For SecureApk, output is directly in the output directory
      return path.join(outputDir, resultFile);
    }
  }
  // Add more tools here in the future
};

// Initialize Express app
const app = express();
app.use(express.json());
app.use(cors());

// Ensure directories exist for all tools
async function ensureDirectories(): Promise<void> {
  for (const tool of Object.values(tools)) {
    try {
      await mkdirPromise(tool.inputDir, { recursive: true });
      await mkdirPromise(tool.outputDir, { recursive: true });
    } catch (error) {
      // Ignore if directories already exist
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw error;
      }
    }
  }
}

// File filter for APK files
const apkFileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype !== 'application/vnd.android.package-archive' && !file.originalname.endsWith('.apk')) {
    return cb(null, false);
  }
  cb(null, true);
};

// Create multer storage for a tool
function createStorage(toolName: string) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, tools[toolName].inputDir);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    }
  });
}

// Create multer upload for a tool
function createUpload(toolName: string) {
  return multer({
    storage: createStorage(toolName),
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max file size
    fileFilter: apkFileFilter
  });
}

// Error handling middleware
interface AppError extends Error {
  status?: number;
}

const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: {
      message: err.message || 'Internal Server Error',
      status
    }
  });
};

// Cleanup function for tool directories
async function cleanupDirectory(dir: string): Promise<void> {
  try {
    // Check if directory exists
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      
      // Handle both files and directories recursively
      if (fs.statSync(filePath).isDirectory()) {
        await cleanupDirectory(filePath);
        fs.rmdirSync(filePath);
      } else {
        fs.unlinkSync(filePath);
      }
    }
  } catch (error) {
    console.error(`Error cleaning up directory ${dir}:`, error);
  }
}

async function handleAnalysis(req: Request, res: Response, next: NextFunction, toolKey: string) {
  const tool = tools[toolKey];
  
  try {
    if (!req.file) {
      const error: AppError = new Error('No APK file provided or invalid file type');
      error.status = 400;
      throw error;
    }
    
    const filename = req.file.filename;
    await cleanupDirectory(tool.outputDir);
    
    const arch = process.arch === 'arm64' ? 'arm64' : 'amd64';
    let dockerCmd = `docker run -v ${tool.inputDir}:/input -v ${tool.outputDir}:/output ${tool.dockerImage}:${arch}`;
    
    if (tool.commandArgs) {
      dockerCmd += ` ${tool.commandArgs(filename)}`;
    }
    
    let analysisCompleted = true;
    try {
      await execPromise(dockerCmd, { maxBuffer: 1024 * 1024 * 10 }); // 10MB buffer
    } catch (error) {
      // Check if tool has fallback option and if error is buffer related
      if (tool.fallbackResultFile && 
          typeof error === 'object' && 
          error !== null && 
          'code' in error && 
          error.code === 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER') {
        console.warn(`Buffer exceeded for ${tool.name}, falling back to partial results`);
        analysisCompleted = false;
      } else {
        console.error(`Error running ${tool.name}:`, error);
        const appError: AppError = new Error(`Failed to analyze APK with ${tool.name}`);
        appError.status = 500;
        throw appError;
      }
    }
    
    try {
      let outputPath;
      if (!analysisCompleted && tool.fallbackResultFile) {
        // Use getResultPath with the fallback file for incomplete analysis
        outputPath = tool.getResultPath(tool.outputDir, filename, tool.fallbackResultFile);
      } else {
        // Use normal path for complete analysis
        outputPath = tool.getResultPath(tool.outputDir, filename, tool.resultFile);
      }

      if (!fs.existsSync(outputPath)) {
        throw new Error(`Result file not found: ${outputPath}`);
      }
      
      const results = await readFilePromise(outputPath, 'utf8');
      
      try {
        await cleanupDirectory(tool.inputDir);
      } catch (cleanupError) {
        console.error('Error during cleanup:', cleanupError);
      }
      
      const response: any = {
        tool: toolKey,
        filename,
        results
      };
      
      // Include completed status if tool has fallback capability
      if (tool.fallbackResultFile) {
        response.completed = analysisCompleted;
      }
      
      res.json(response);
    } catch (error) {
      console.error(`Error reading results:`, error);
      const appError: AppError = new Error(`Failed to read analysis results from ${tool.name}`);
      appError.status = 500;
      throw appError;
    }
  } catch (error) {
    next(error);
  }
}

// Create API endpoints for each tool
for (const [toolKey, toolConfig] of Object.entries(tools)) {
  const upload = createUpload(toolKey);
  
  app.post(`/api/${toolKey}`, upload.single('apk'), (req, res, next) => {
    handleAnalysis(req, res, next, toolKey);
  });
  
  console.log(`Created endpoint for ${toolConfig.name}: /api/${toolKey}`);
}

// Start the server
(async () => {
  try {
    await ensureDirectories();
    app.use(errorHandler);
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Available endpoints:`);
      Object.keys(tools).forEach(toolKey => {
        console.log(`- /api/${toolKey}`);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();