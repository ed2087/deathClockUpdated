const fs = require('fs').promises;

module.exports.readFileAPI = async function (apiName) {
  // Define the path to the file based on the given API name
  const filePath = `./utils/api/${apiName}`; // Adjust the path as needed

  try {
    // Read the file asynchronously
    const fileContent = await fs.readFile(filePath, 'utf8');

    return fileContent;
  } catch (err) {
    // Handle any errors, such as the file not existing
    console.error(err);
    throw err; // You can choose to throw the error or handle it differently
  }
};
