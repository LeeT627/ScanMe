const { createClient } = require('@supabase/supabase-js');

// YOU NEED TO UPDATE THESE WITH YOUR ACTUAL SUPABASE CREDENTIALS
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addQRCodes() {
  const qrCodes = [
    {
      id: 'US_Shirt_logo',
      name: 'US Shirt Logo',
      description: 'QR code for US shirt logo',
      created_by: 'admin@gpai.app'
    },
    {
      id: 'Boston',
      name: 'Boston',
      description: 'QR code for Boston location',
      created_by: 'admin@gpai.app'
    },
    {
      id: 'New_York', 
      name: 'New York',
      description: 'QR code for New York location',
      created_by: 'admin@gpai.app'
    }
  ];

  console.log('Adding QR codes to Supabase...');
  
  for (const qr of qrCodes) {
    try {
      const { data, error } = await supabase
        .from('qr_codes')
        .insert({
          id: qr.id,
          name: qr.name,
          description: qr.description,
          created_by: qr.created_by,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error(`Error adding ${qr.name}:`, error);
      } else {
        console.log(`✓ Added ${qr.name} (ID: ${qr.id})`);
      }
    } catch (err) {
      console.error(`Failed to add ${qr.name}:`, err);
    }
  }

  console.log('\nQR codes added successfully!');
  console.log('\nYour QR code URLs will be:');
  qrCodes.forEach(qr => {
    console.log(`  - https://your-domain.vercel.app/api/scan/${qr.id}`);
  });
}

addQRCodes();