import { spawn, spawnSync } from 'child_process';

class PythonRunner {
    functionName: string;
    scriptPath: string;
    argument: any;

    constructor(functionName: string, scriptPath: string, argument: string) {
        this.functionName = functionName;
        this.scriptPath = scriptPath;
        this.argument = argument;
    }

    runPythonFuntions(scriptPath: string, functionName: string, argument?: any) {
        const python_process = spawnSync('python', [scriptPath, functionName, argument]);

        if (python_process.status == 0) {
            console.log('python script executed with success. Exit code:' + python_process.status)
            return python_process.stdout.toString();
        } else {
            console.log('python script executed with exit code:' + python_process.status)
            console.log('python script execution info:' + python_process.stdout.toString())
            console.log('python script execution info:' + python_process.stderr.toString())
        }
    }
}

export { PythonRunner }
