import { cloudinary } from '../src/config/cloudinary.js';

console.log('Cloudinary config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? 'SET' : 'MISSING',
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'MISSING'
});

(async function(){
  try {
    const res = await cloudinary.api.resources({ max_results: 1 });
    console.log('API call succeeded, resources count:', res.resources.length);
  } catch (err) {
    console.error('Cloudinary API error:', err.message || err);
  }
})();
