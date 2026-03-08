const fs = require('fs');

const appPath = 'app.js';
const workerPath = 'lib/gif.worker.js';

const workerCode = fs.readFileSync(workerPath, 'utf8');
const base64Code = Buffer.from(workerCode).toString('base64');

let appCode = fs.readFileSync(appPath, 'utf8');

const funcStr = `
            // Web Worker를 파일(:file//) 프로토콜에서도 완벽하게 구동하기 위한 인라인 우회 처리
            function getWorkerBlob() {
                const b64 = '${base64Code}';
                const bin = atob(b64);
                const arr = new Uint8Array(bin.length);
                for(let i=0; i<bin.length; i++) arr[i] = bin.charCodeAt(i);
                return URL.createObjectURL(new Blob([arr], {type: 'application/javascript'}));
            }
`;

if (!appCode.includes('getWorkerBlob()')) {
    const target = "const gif = new GIF({";
    appCode = appCode.replace(target, funcStr + "\n            " + target);

    appCode = appCode.replace("workerScript: 'lib/gif.worker.js',", "workerScript: getWorkerBlob(),");
    fs.writeFileSync(appPath, appCode);
    console.log("Worker injected successfully!");
} else {
    console.log("Already injected.");
}
