// Middleware để parse JSON fields từ form-data
const parseFormData = (req, res, next) => {
  try {
    console.log('=== PARSE FORM DATA DEBUG ===');
    console.log('Original req.body:', req.body);
    
    // Parse icon field
    if (req.body.icon && typeof req.body.icon === 'string') {
      console.log('Parsing icon:', req.body.icon);
      req.body.icon = JSON.parse(req.body.icon);
    }

    // Parse stats field
    if (req.body.stats && typeof req.body.stats === 'string') {
      console.log('Parsing stats:', req.body.stats);
      req.body.stats = JSON.parse(req.body.stats);
    }

    // Parse skills field
    if (req.body.skills && typeof req.body.skills === 'string') {
      console.log('Parsing skills:', req.body.skills);
      const parsed = JSON.parse(req.body.skills);
      // Nếu parse được một object đơn lẻ, chuyển thành array
      req.body.skills = Array.isArray(parsed) ? parsed : [parsed];
    }

    // Convert numeric fields
    if (req.body.dna_rate && typeof req.body.dna_rate === 'string') {
      req.body.dna_rate = parseInt(req.body.dna_rate);
    }

    console.log('Parsed req.body:', req.body);
    console.log('=== END PARSE FORM DATA DEBUG ===');

    next();
  } catch (error) {
    console.error('Parse form data error:', error);
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON format in form data',
      error: error.message
    });
  }
};

module.exports = parseFormData;
