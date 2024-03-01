import express from 'express';
import multer, {Field} from 'multer'

import validator from './fileUpload.validator';

import FileUploadController from './fileUpload.controller';
import {fileUploadTypes} from '../../devu-shared-modules';

const Router = express.Router();
const upload = multer();

/*
  * This is a list of all the fields that can be uploaded
  * if you want to limit the file upload to a specific type, you can change the list here by
  * changing into the following lines:
   fileUploadTypes.map(name => ({
   if (name === 'fileTypeYouWantToLimitTo'){
    return {name, maxCount: Number}
   }
   return {name}
   })
 */
const fields: Field[] = fileUploadTypes.map(name => ({name}))
/**
 * @swagger
 * /file-upload/{bucketName}:
 *   get:
 *     summary: Retrieve a list of all files in the bucket
 */

Router.get('/:bucketName', FileUploadController.get);
/**
 * @swagger
 * /file-upload/{bucketName}/{fileName}:
 *   get:
 *     summary: Retrieve a single file from the bucket
 */
Router.get('/:bucketName/:fileName', FileUploadController.detail);

/**
 * @swagger
 * /file-upload/:
 *   post:
 *     summary: Upload a new file to the bucket
 */
Router.post('/', upload.fields(fields), validator, FileUploadController.post);

/**
 * @swagger
 * /file-upload/{bucketName}:
 *   put:
 *     summary: Update a file in the bucket
 *
 *
 * does not have idea whether the path should have the bucketName or not
 * leave for discussion
 */
Router.put('/:bucketName', upload.fields(fields), validator, FileUploadController.put);


export default Router;