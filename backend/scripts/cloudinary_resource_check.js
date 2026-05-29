import { cloudinary } from '../src/config/cloudinary.js';

(async function(){
  try {
    const publicId = 'pyqwithme/papers/1779764821417-e2e-temp-pdf.pdf';
    const res = await cloudinary.api.resource(publicId, { resource_type: 'raw' });
    console.log('resource:', res);
  } catch (err) {
    console.error('error:', err.message || err);
  }
})();
