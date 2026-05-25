const fs = require('fs');
const path = require('path');

const modelsDir = 'C:\\Users\\keanc\\Desktop\\faceguard-app\\public\\models';
const files = fs.readdirSync(modelsDir);

const jsonFiles = files.filter(f => f.endsWith('.json'));
const weightFiles = files.filter(f => f.match(/(\.bin$|shard\d+$)/));

const normalizeName = f => {
  let name = f.replace(/-weights_manifest\.json$/, '');
  name = name.replace(/-shard\d+(\.bin)?$/, '');
  name = name.replace(path.extname(name), '');
  return name;
};

console.log('Checking model files in:', modelsDir);
console.log('------------------------------------');

let allGood = true;

// Check manifests
jsonFiles.forEach(json => {
  const baseName = normalizeName(json);
  const hasWeight = weightFiles.some(w => normalizeName(w) === baseName);
  if (hasWeight) {
    console.log(`✅ ${baseName}: JSON and weight files found.`);
  } else {
    console.log(`❌ ${baseName}: Missing weight file!`);
    allGood = false;
  }
});

// Check weights
weightFiles.forEach(weight => {
  const baseName = normalizeName(weight);
  const hasJson = jsonFiles.some(j => normalizeName(j) === baseName);
  if (!hasJson) {
    console.log(`❌ ${baseName}: Missing .json manifest!`);
    allGood = false;
  }
});

if (allGood) {
  console.log('\n✅ All model files are complete and properly paired!');
} else {
  console.log('\n⚠️ Some files are missing pairs or named incorrectly.');
}
