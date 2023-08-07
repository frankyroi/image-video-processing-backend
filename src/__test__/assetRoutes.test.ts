import request from 'supertest';
import { createConnection, getConnection, getRepository } from 'typeorm';
import {app} from '../index'; 
import path from 'path';
import { Asset } from '../entities/Asset';
import sharp from 'sharp';
import { config } from 'dotenv';
config();

jest.setTimeout(200000);


// Test suite for Asset route
describe('Asset Route', () => {
  beforeAll(async () => {
    await createConnection({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: true,
      entities: [process.cwd() + "/src/entities/*.ts"],
      migrations: [process.cwd() + "/src/migrations/*.ts"],
    });
  });

  afterAll(async () => {
    const connection = getConnection();
    await connection.close();
  });

  let uploadedAssetId: any;
  let uploadedVideoAssetId: any;
  

  it('should upload an image successfully', async () => {
    try {
      const imagePath = path.join(__dirname, '/assets/AdobeStock_282001674-scaled-1-1080x675.jpeg');
      const response = await request(app)
        .post('/api/asset/upload')
        .attach('file', imagePath);
  
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('assetId');

      uploadedAssetId = response.body.assetId;
    } catch (error) {
      console.log(error);
      throw error;
    }
  });

  it('should return an error for invalid image format', async () => {
    try {
      const imagePath = path.join(__dirname, '/assets/image.webp');
      const response = await request(app)
        .post('/api/asset/upload')
        .attach('file', imagePath);
  
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Please upload a PNG or JPEG image file.');

    } catch (error) {
      console.log(error);
      throw error;
    }
  });

  it('should resize and rotate an image successfully', async () => {
    expect(uploadedAssetId).toBeDefined();

    const assetRepository = getRepository(Asset);
    const asset = await assetRepository.findOne({ where: {assetId: uploadedAssetId} });

    // Perform resize and rotate request
    const response = await request(app)
      .get(`/api/asset/resize-and-rotate/${asset?.assetId}`)
      .query({ width: 200, height: 200, angle: 90 });

    expect(response.status).toBe(200);
    expect(response.header['content-type']).toBe('image/jpeg'); // Assuming the uploaded image is JPEG
    expect(response.header['content-disposition']).toMatch(`attachment; filename=${asset?.fileName}`);

    // Read the response body as a buffer using sharp
    const resizedImageBuffer = Buffer.from(response.body);

    // Check the image properties using sharp
    const imageInfo = await sharp(resizedImageBuffer).metadata();

    // Assertions for image properties
    expect(imageInfo.format).toBe('jpeg'); // Assuming the resized image format is JPEG
    expect(imageInfo.width).toBe(200);
    expect(imageInfo.height).toBe(200);    
  });

  it('should upload a video successfully', async () => {
    try {
      const videoPath = path.join(__dirname, '/assets/video.mp4');
      const response = await request(app)
        .post('/api/asset/uploadVideo')
        .attach('video', videoPath);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('assetId');

      uploadedVideoAssetId = response.body.assetId;
    } catch (error) {
      console.log(error)
      throw error; 
    }
  });

  it('should return an error for invalid video format', async () => {
    try {
      const videoPath = path.join(__dirname, '/assets/sample.mkv');
      const response = await request(app)
        .post('/api/asset/uploadVideo')
        .attach('video', videoPath);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Please upload an MP4 video file.');

    } catch (error) {
      console.log(error)
      throw error; 
    }
  });

  it('should add a watermark to a video successfully', async () => {
    try {
      expect(uploadedVideoAssetId).toBeDefined();

      const response = await request(app)
        .post(`/api/asset/addWatermarkToVideo/${uploadedVideoAssetId}`);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('downloadUrl');
    } catch (error) {
      console.log(error);
      throw error;
    }
  });

  it('should extract audio from a video successfully', async () => {
    try {
      expect(uploadedVideoAssetId).toBeDefined();

      const response = await request(app)
        .post(`/api/asset/extractAudioFromVideo/${uploadedVideoAssetId}`);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('downloadUrl');
    } catch (error) {
      console.log(error);
      throw error;
    }
  });

});


