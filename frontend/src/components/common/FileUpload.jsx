import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  LinearProgress,
  Alert,
  Chip,
} from "@mui/material";
import {
  CloudUpload,
  InsertDriveFile,
  Delete,
  CheckCircle,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";

function FileUpload({
  files = [],
  onFilesChange,
  maxFiles = 3,
  disabled = false,
}) {
  const { enqueueSnackbar } = useSnackbar();
  const [uploading, setUploading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: maxFiles - files.length,
    disabled: disabled || uploading || files.length >= maxFiles,
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach((file) => {
          if (file.errors[0]?.code === "file-invalid-type") {
            enqueueSnackbar("Only PDF files are allowed", { variant: "error" });
          } else {
            enqueueSnackbar(
              `Error with ${file.file.name}: ${file.errors[0]?.message}`,
              { variant: "error" }
            );
          }
        });
      }

      if (acceptedFiles.length > 0) {
        const totalFiles = files.length + acceptedFiles.length;
        if (totalFiles > maxFiles) {
          enqueueSnackbar(`You can only upload up to ${maxFiles} files`, {
            variant: "warning",
          });
          acceptedFiles = acceptedFiles.slice(0, maxFiles - files.length);
        }

        const newFiles = acceptedFiles.map((file) => ({
          file,
          id: `${Date.now()}-${file.name}`,
          name: file.name,
          size: file.size,
          status: "pending",
          progress: 0,
        }));

        onFilesChange([...files, ...newFiles]);
      }
    },
  });

  const removeFile = (fileId) => {
    onFilesChange(files.filter((f) => f.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const canUpload = files.length < maxFiles && !uploading && !disabled;

  return (
    <Box>
      {canUpload && (
        <Paper
          {...getRootProps()}
          sx={{
            p: 3,
            border: "2px dashed",
            borderColor: isDragActive ? "primary.main" : "divider",
            bgcolor: isDragActive ? "action.hover" : "background.paper",
            cursor: "pointer",
            transition: "all 0.3s",
            "&:hover": {
              borderColor: "primary.main",
              bgcolor: "action.hover",
            },
          }}
        >
          <input {...getInputProps()} />
          <Box sx={{ textAlign: "center" }}>
            <CloudUpload
              sx={{ fontSize: 48, color: "text.secondary", mb: 1 }}
            />
            <Typography variant="body1" gutterBottom>
              {isDragActive
                ? "Drop the files here..."
                : "Drag & drop PDF files here, or click to select"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Maximum {maxFiles} files, PDF only, up to 5MB each
            </Typography>
          </Box>
        </Paper>
      )}

      {files.length >= maxFiles && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Maximum number of files ({maxFiles}) reached
        </Alert>
      )}

      {files.length > 0 && (
        <List sx={{ mt: 2 }}>
          {files.map((file) => (
            <ListItem
              key={file.id}
              sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                mb: 1,
                bgcolor: "background.paper",
              }}
            >
              <ListItemIcon>
                <InsertDriveFile color="error" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                      {file.name || file.originalName}
                    </Typography>
                    {file.status === "uploaded" && (
                      <CheckCircle color="success" sx={{ fontSize: 16 }} />
                    )}
                    {file.status === "error" && (
                      <ErrorIcon color="error" sx={{ fontSize: 16 }} />
                    )}
                  </Box>
                }
                secondary={
                  <>
                    <Typography
                      component="span"
                      variant="caption"
                      color="text.secondary"
                    >
                      {formatFileSize(file.size)}
                    </Typography>
                    {file.status === "uploading" && (
                      <LinearProgress
                        variant="determinate"
                        value={file.progress}
                        sx={{ mt: 0.5, height: 2 }}
                      />
                    )}
                  </>
                }
              />
              {!disabled && file.status !== "uploading" && (
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => removeFile(file.id)}
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              )}
            </ListItem>
          ))}
        </List>
      )}

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          {files.length} of {maxFiles} files
        </Typography>
        {files.length > 0 && (
          <Chip
            label={`${
              files.filter((f) => f.status === "uploaded").length
            } uploaded`}
            size="small"
            color="success"
            variant="outlined"
          />
        )}
      </Box>
    </Box>
  );
}

export default FileUpload;
