'use strict';

const path = require('path');
const mongoose = require(path.resolve(__dirname, '../../core/node_modules/mongoose'));
const env = require(path.resolve(__dirname, '../../core/src/config/env'));

async function convertDanhmucToFolder() {
  await mongoose.connect(env.MONGO_URI);
  const db = mongoose.connection.db;

  const folderTemplateId = new mongoose.Types.ObjectId('6ae95cc6b1e541e051fd413e');
  const folderTemplate = {
    id: folderTemplateId,
    name: 'Folder',
    path: '/root/templates/common/Folder',
  };

  const updateMaster = {
    templateId: folderTemplateId,
    template: folderTemplate,
    displayName: 'Danh mục',
    presentation: {
      shared: { layoutId: null, renderings: [] },
    },
    languages: [
      {
        code: 'vi',
        unversionedFields: {},
        publishedVersion: 1,
        versions: [
          {
            version: 1,
            fields: {},
            finalLayout: { layoutId: null, renderings: [] },
          },
        ],
      },
    ],
  };

  const resMaster = await db.collection('items_master').updateOne(
    { path: { $regex: '^/root/content/home/danh-muc$', $options: 'i' } },
    { $set: updateMaster }
  );
  console.log('Master items updated:', resMaster.modifiedCount);

  const resWeb = await db.collection('items_web').updateOne(
    { path: { $regex: '^/root/content/home/danh-muc$', $options: 'i' } },
    {
      $set: {
        templateId: folderTemplateId,
        template: folderTemplate,
        displayName: 'Danh mục',
        presentation: {
          shared: { layoutId: null, renderings: [] },
        },
        languages: [
          {
            code: 'vi',
            publishedVersion: 1,
            fields: {},
            finalLayout: { layoutId: null, renderings: [] },
          },
        ],
      },
    }
  );
  console.log('Web items updated:', resWeb.modifiedCount);

  await mongoose.disconnect();
  console.log('Converted /root/content/home/danh-muc to Folder successfully.');
}

convertDanhmucToFolder().catch((err) => {
  console.error('Failed to convert danh-muc:', err);
  process.exit(1);
});
