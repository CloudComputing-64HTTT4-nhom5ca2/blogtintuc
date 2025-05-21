const fs = require('fs');
const path = require('path');

// Kiểm tra cấu trúc thư mục
console.log('Kiểm tra cấu trúc thư mục...');
const clientBuildExists = fs.existsSync(path.join(__dirname, 'client-build'));
console.log(`- Thư mục client-build: ${clientBuildExists ? 'Tồn tại ✓' : 'Không tồn tại ✗'}`);

if (clientBuildExists) {
  const indexHtmlExists = fs.existsSync(path.join(__dirname, 'client-build', 'index.html'));
  console.log(`- File client-build/index.html: ${indexHtmlExists ? 'Tồn tại ✓' : 'Không tồn tại ✗'}`);

  const staticJsExists = fs.existsSync(path.join(__dirname, 'client-build', 'static', 'js'));
  console.log(`- Thư mục client-build/static/js: ${staticJsExists ? 'Tồn tại ✓' : 'Không tồn tại ✗'}`);

  const staticCssExists = fs.existsSync(path.join(__dirname, 'client-build', 'static', 'css'));
  console.log(`- Thư mục client-build/static/css: ${staticCssExists ? 'Tồn tại ✓' : 'Không tồn tại ✗'}`);
}

// Kiểm tra cấu hình app.yaml
console.log('\nKiểm tra cấu hình app.yaml...');
try {
  const appYaml = fs.readFileSync(path.join(__dirname, 'app.yaml'), 'utf8');
  console.log('- File app.yaml: Tồn tại ✓');

  const hasClientBuildPath = appYaml.includes('client-build');
  console.log(`- Đường dẫn client-build trong app.yaml: ${hasClientBuildPath ? 'Tồn tại ✓' : 'Không tồn tại ✗'}`);

  if (!hasClientBuildPath) {
    console.log('  Cần cập nhật app.yaml để sử dụng đường dẫn client-build thay vì client/build');
  }
} catch (error) {
  console.log('- File app.yaml: Không tồn tại hoặc không thể đọc ✗');
}

// Kiểm tra cấu hình server/index.js
console.log('\nKiểm tra cấu hình server/index.js...');
try {
  const serverIndex = fs.readFileSync(path.join(__dirname, 'server', 'index.js'), 'utf8');
  console.log('- File server/index.js: Tồn tại ✓');

  const hasClientBuildPath = serverIndex.includes('../client-build');
  console.log(`- Đường dẫn ../client-build trong server/index.js: ${hasClientBuildPath ? 'Tồn tại ✓' : 'Không tồn tại ✗'}`);

  if (!hasClientBuildPath) {
    console.log('  Cần cập nhật server/index.js để sử dụng đường dẫn ../client-build thay vì ../client/build');
  }
} catch (error) {
  console.log('- File server/index.js: Không tồn tại hoặc không thể đọc ✗');
}

// Kiểm tra package.json
console.log('\nKiểm tra cấu hình package.json...');
try {
  const packageJson = require('./package.json');
  console.log('- File package.json: Tồn tại ✓');
  console.log(`- Main file: ${packageJson.main}`);
  console.log(`- Start script: ${packageJson.scripts.start}`);

  // Kiểm tra dependencies
  const requiredDeps = ['express', 'cors', 'firebase-admin', 'dotenv'];
  const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);

  if (missingDeps.length === 0) {
    console.log('- Tất cả dependencies cần thiết đã được cài đặt ✓');
  } else {
    console.log(`- Thiếu dependencies: ${missingDeps.join(', ')} ✗`);
  }
} catch (error) {
  console.log('- File package.json: Không tồn tại hoặc không thể đọc ✗');
}

console.log('\nGợi ý khắc phục lỗi "Cannot GET /"');
console.log('1. Đảm bảo thư mục client-build chứa đầy đủ các file build của React app');
console.log('2. Đảm bảo server/index.js trỏ đến đúng thư mục client-build');
console.log('3. Đảm bảo app.yaml cấu hình đúng đường dẫn client-build');
console.log('4. Thử chạy lệnh "npm start" để kiểm tra server có hoạt động không');
console.log('5. Kiểm tra logs khi triển khai lên GCP bằng lệnh "gcloud app logs tail"');
