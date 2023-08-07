import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Asset } from '../entities/Asset';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { spawn } from 'child_process';

export const uploadImage = async (req: Request, res: Response) => {
  try {
    const image = req.file;
    if (!image) {
      return res.status(400).json({ message: 'Please upload a PNG or JPEG image file.' });
    }
    
    const asset = new Asset();
    const assetId = uuidv4();
    asset.assetId = assetId;
    asset.fileName = image.filename;

    const assetRepository = getRepository(Asset);
    await assetRepository.save(asset);

    return res.status(201).json({ assetId });
  } catch (error) {
    console.error('Error uploading asset:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const resizeAndRotateImage = async (req: Request, res: Response) => {
  try {
    const assetRepository = getRepository(Asset);
    const id = req.params.id;
    const { width, height, angle } = req.query;

    // Check if the asset ID exists in the database
    const asset = await assetRepository.findOne({ where: {assetId: id} });
    
    if (!asset) {
      return res.status(404).json({ message: 'File not found.' });
    }

    // Get the file path based on the stored file name
    const filePath = path.join('uploads', asset.fileName);

    // Read the image
    const image = sharp(filePath);

    // Apply rotation if angle is provided in the query
    if (angle) {
      const parsedAngle = parseInt(angle as string, 10);
      if (!isNaN(parsedAngle)) {
        await image.rotate(parsedAngle);
      }
    }

    // Resize the image if width and height are specified
    if (width && height) {
      const parsedWidth = parseInt(width as string, 10);
      const parsedHeight = parseInt(height as string, 10);
      if (!isNaN(parsedWidth) && !isNaN(parsedHeight)) {
        await image.resize(parsedWidth, parsedHeight);
      }
    }

    // Convert the image to a buffer
    const resizedImageBuffer = await image.toBuffer();

    // Send the resized and rotated image to the client
    res.setHeader('Content-Disposition', `attachment; filename=${asset.fileName}`);
    res.setHeader('Content-Type', 'image/jpeg'); // Assuming the uploaded image is JPEG
    res.send(resizedImageBuffer);
  } catch (error) {
    console.error('Error resizing and rotating image:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const uploadVideo = async (req: Request, res: Response) => {
  try {
    const assetRepository = getRepository(Asset);

    const videoFile = req.file;

    if (!videoFile) {
      return res.status(400).json({ message: 'Please upload an MP4 video file.' });
    }

    // Generate a unique assetId.
    const assetId = uuidv4();

    // Save the asset information in the database.
    const asset = new Asset();
    asset.assetId = assetId;
    asset.fileName = videoFile.filename;
    await assetRepository.save(asset);

    return res.status(201).json({ assetId });
  } catch (error) {
    console.error('Error uploading video:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const addWatermarkToVideo = async (req: Request, res: Response) => {
  try {
        const assetRepository = getRepository(Asset);

        const assetId = req.params.assetId;
 
        const asset = await assetRepository.findOne({ where: {assetId: assetId} });
    
        if (!asset) {
          return res.status(404).json({ message: 'File not found.' });
        }

        
        // Get the file path based on the stored file name
        const videoFile = path.join('uploads/videos', asset.fileName);
        
        console.log(videoFile);
        // const assetId = asset.assetId;
        
        // Add the watermark to the video using ffmpeg
        const watermarkPath = path.join(__dirname, '../../src/cogart-logo.png'); 
        const processedVideoPath = path.join(__dirname, '..', 'public', 'processed-videos', `${assetId}.mp4`);
        const ffmpegArgs = [
        '-i', videoFile,
        '-i', watermarkPath,
        '-filter_complex', '[0:v][1:v]overlay=W-w-10:H-h-10[out]',
        '-map', '[out]',
        '-map', '0:a?',
        processedVideoPath,
        ];

        const ffmpegProcess = spawn('ffmpeg', ffmpegArgs);

        let stderrData = '';
        ffmpegProcess.stderr.on('data', (data) => {
        stderrData += data.toString();
        });

        ffmpegProcess.on('close', async (code) => {
        if (code === 0) {
            const asset = new Asset();
            asset.assetId = assetId;
            asset.fileName = `${assetId}.mp4`;
            await assetRepository.save(asset);

            // Return the download URL of the processed video
            const downloadUrl = `/processed-videos/${assetId}.mp4`;
            return res.status(201).json({ downloadUrl });
        } else {
            // Processing error
            console.error('Error processing video:', stderrData);

            // Return the error response with stderrData
            return res.status(500).json({ message: 'Error processing video.', stderr: stderrData });
        }
        });

  } catch (error) {
    console.error('Error processing video:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const extractAudioFromVideo = async (req: Request, res: Response) => {
  try {
    const assetId = req.params.assetId;
 
    if (!assetId) {
        return res.status(404).json({ message: 'assetId is required.' });
    }

    const assetRepository = getRepository(Asset);
    const asset = await assetRepository.findOne({ where: {assetId: assetId} });
    
    if (!asset) {
        return res.status(404).json({ message: 'File not found.' });
    }
    
    // Get the file path based on the stored file name
    const videoFile = path.join('uploads/videos', asset.fileName);

    // Extract the audio from the video using ffmpeg
    const audioPath = path.join(__dirname, '..', 'public', 'audios', `${assetId}.mp3`); // Extracted audio will be stored in public/audios
    const ffmpegArgs = [
      '-i', videoFile,
      '-vn',
      '-acodec', 'libmp3lame',
      audioPath,
    ];

    const ffmpegProcess = spawn('ffmpeg', ffmpegArgs);

    ffmpegProcess.on('close', async (code) => {
      if (code === 0) {
        const asset = new Asset();
        asset.assetId = assetId;
        asset.fileName = `${assetId}.mp3`;
        await assetRepository.save(asset);

        // Return the download URL of the extracted audio
        const downloadUrl = `/audios/${assetId}.mp3`;
        return res.status(201).json({ downloadUrl });
      } else {
        return res.status(500).json({ message: 'Error extracting audio.' });
      }
    });
  } catch (error) {
    console.error('Error extracting audio:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

