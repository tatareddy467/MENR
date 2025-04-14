import axios from "axios";

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_APP_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env
  .VITE_APP_CLOUDINARY_UPLOAD_PRESET;

const uploadFileToCloudinary = async (files) => {
  try {
    // Handle both single file and multiple files
    const fileArray = Array.isArray(files) ? files : [files];
    const uploadedUrls = [];

    for (const file of fileArray) {
      // Create form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET); // Set your Cloudinary upload preset
      //   formData.append("cloud_name", CLOUDINARY_CLOUD_NAME); // Set your Cloudinary cloud name

      // Upload to Cloudinary
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response.data);
      uploadedUrls.push(response.data.secure_url);
    }

    // https://api.cloudinary.com/v1_1/<cloud name>/<resource_type>/upload

    // Return single URL for single file, array of URLs for multiple files
    return Array.isArray(files) ? uploadedUrls : uploadedUrls[0];
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error("Failed to upload file(s)");
  }
};

export default uploadFileToCloudinary;
