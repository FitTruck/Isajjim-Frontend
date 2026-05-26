const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// @react-three/fiber와 zustand가 ESM(.mjs, .esm.js)으로 로드되어
// import.meta SyntaxError 발생. resolveRequest로 CJS 파일을 직접 지정.
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // @react-three/fiber → CJS 강제
  if (moduleName === '@react-three/fiber') {
    return {
      type: 'sourceFile',
      filePath: path.resolve(__dirname, 'node_modules/@react-three/fiber/dist/react-three-fiber.cjs.js'),
    };
  }

  // zustand 및 서브패스 → CJS 강제
  if (moduleName === 'zustand' || moduleName.startsWith('zustand/')) {
    const subpath = moduleName === 'zustand' ? 'index' : moduleName.slice('zustand/'.length);
    const cjsPath = path.resolve(__dirname, `node_modules/zustand/${subpath}.js`);
    return { type: 'sourceFile', filePath: cjsPath };
  }

  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
