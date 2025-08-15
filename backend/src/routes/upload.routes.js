const express = require('express');
const router = express.Router({ mergeParams: true });
const { upload, uploadToCloudinary, cloudinary, getDownloadUrl } = require('../config/cloudinary');
const { protect } = require('../middleware/auth.middleware');
const Task = require('../models/Task');

// Upload files to task
router.post('/upload', protect, upload.array('documents', 3), async (req, res) => {
  try {
    console.log('=== UPLOAD START ===');
    console.log('Files received:', req.files?.length || 0);
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }
    
    const { taskId } = req.params;
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check file limit
    if (task.attachments.length + req.files.length > 3) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 3 files allowed per task'
      });
    }

    console.log('Uploading files to Cloudinary...');
    
    // Upload each file to Cloudinary
    const uploadPromises = req.files.map(async (file) => {
      try {
        const result = await uploadToCloudinary(file.buffer, file.originalname);
        
        // Ensure original name has .pdf extension
        let originalName = file.originalname;
        if (!originalName.toLowerCase().endsWith('.pdf')) {
          originalName += '.pdf';
        }
        
        return {
          filename: result.public_id,
          originalName: originalName,
          url: result.secure_url, // Use secure_url from Cloudinary
          publicId: result.public_id,
          size: file.size,
          mimeType: 'application/pdf',
          uploadedBy: req.user._id,
          cloudinaryUrl: result.url, // Store both URLs
          secureUrl: result.secure_url
        };
      } catch (error) {
        console.error('Failed to upload file:', file.originalname, error);
        throw error;
      }
    });

    const newAttachments = await Promise.all(uploadPromises);
    console.log('All files uploaded successfully');

    // Add to task
    task.attachments.push(...newAttachments);
    await task.save();

    console.log('=== UPLOAD COMPLETE ===');

    res.status(200).json({
      success: true,
      message: 'Files uploaded successfully',
      data: { task }
    });
  } catch (error) {
    console.error('=== UPLOAD ERROR ===');
    console.error('Error:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Error uploading files',
      error: error.message
    });
  }
});

// Add this to upload.routes.js for debugging
router.get('/debug-files', protect, async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check each attachment in Cloudinary
    const fileChecks = await Promise.all(
      task.attachments.map(async (att) => {
        try {
          const resource = await cloudinary.api.resource(att.publicId, {
            resource_type: 'raw'
          });
          return {
            filename: att.originalName,
            exists: true,
            cloudinaryUrl: resource.secure_url
          };
        } catch (error) {
          return {
            filename: att.originalName,
            exists: false,
            error: error.message
          };
        }
      })
    );
    
    res.json({
      attachments: task.attachments,
      cloudinaryCheck: fileChecks
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get file URL for download
router.get('/files/:fileId/url', protect, async (req, res) => {
  try {
    const { taskId, fileId } = req.params;
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const attachment = task.attachments.find(att => att._id.toString() === fileId);
    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Generate fresh download URL
    const downloadUrl = cloudinary.url(attachment.publicId, {
      resource_type: 'raw',
      flags: 'attachment',
      type: 'upload',
      secure: true
    });

    res.json({
      success: true,
      url: downloadUrl,
      originalUrl: attachment.url,
      filename: attachment.originalName
    });
  } catch (error) {
    console.error('Get URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting file URL'
    });
  }
});


// Download file with proper headers
router.get('/files/:fileId/download', protect, async (req, res) => {
  try {
    const { taskId, fileId } = req.params;
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const attachment = task.attachments.find(att => att._id.toString() === fileId);
    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Add fl_attachment to force download
    let downloadUrl = attachment.url;
    downloadUrl = downloadUrl.replace('/upload/', '/upload/fl_attachment/');
    
    // Redirect with download headers
    res.redirect(downloadUrl);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading file'
    });
  }
});

module.exports = router;