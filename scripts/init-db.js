const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// User Schema (simplified for script)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'client', 'vendor'], required: true },
  partyName: String,
  transporterName: String,
  phone: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Job Schema (simplified for script)
const jobSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  jobNumber: { type: String, required: true },
  invoiceNumber: { type: String, required: true },
  partyName: { type: String, required: true },
  containerType: { type: String, enum: ['CTNS', 'FCL', 'LCL'], required: true },
  shippingLine: { type: String, required: true },
  destination: { type: String, required: true },
  vessel: { type: String, required: true },
  truck: { type: String, required: true },
  containerNumbers: [{ type: String }],
  port: { type: String, required: true },
  cutOffDate: { type: Date, required: true },
  etd: { type: Date, required: true },
  vehicleAtd: Date,
  vehicleArrv: Date,
  transporter: { type: String, required: true },
  remarks: String,
  cellNumber: String,
  status: { type: String, enum: ['pending', 'in_transit', 'delivered', 'cleared', 'dispatched'], default: 'pending' },
  assignedVendor: String,
}, { timestamps: true });

const Job = mongoose.model('Job', jobSchema);

async function initDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/als_dashboard');
    console.log('Connected to MongoDB successfully!');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists. Skipping user creation.');
    } else {
      // Create default admin user
      const hashedPassword = await bcrypt.hash('admin123', 12);
      const adminUser = new User({
        email: 'admin@als.com',
        password: hashedPassword,
        name: 'ALS Admin',
        role: 'admin',
        isActive: true
      });
      await adminUser.save();
      console.log('✅ Default admin user created:');
      console.log('   Email: admin@als.com');
      console.log('   Password: admin123');
    }

    // Create sample client user
    const existingClient = await User.findOne({ email: 'client@example.com' });
    if (!existingClient) {
      const hashedPassword = await bcrypt.hash('client123', 12);
      const clientUser = new User({
        email: 'client@example.com',
        password: hashedPassword,
        name: 'Sample Client',
        role: 'client',
        partyName: 'Sample Company Ltd',
        phone: '+1234567890',
        isActive: true
      });
      await clientUser.save();
      console.log('✅ Sample client user created:');
      console.log('   Email: client@example.com');
      console.log('   Password: client123');
      console.log('   Party Name: Sample Company Ltd');
    }

    // Create sample vendor user
    const existingVendor = await User.findOne({ email: 'vendor@example.com' });
    if (!existingVendor) {
      const hashedPassword = await bcrypt.hash('vendor123', 12);
      const vendorUser = new User({
        email: 'vendor@example.com',
        password: hashedPassword,
        name: 'Sample Transporter',
        role: 'vendor',
        transporterName: 'Fast Logistics Ltd',
        phone: '+0987654321',
        isActive: true
      });
      await vendorUser.save();
      console.log('✅ Sample vendor user created:');
      console.log('   Email: vendor@example.com');
      console.log('   Password: vendor123');
      console.log('   Transporter: Fast Logistics Ltd');
    }

    // Create sample jobs
    const existingJobs = await Job.countDocuments();
    if (existingJobs === 0) {
      const sampleJobs = [
        {
          date: new Date('2024-01-15'),
          jobNumber: 'JOB-001',
          invoiceNumber: 'INV-001',
          partyName: 'Sample Company Ltd',
          containerType: 'FCL',
          shippingLine: 'Maersk',
          destination: 'Dubai',
          vessel: 'MSC Oscar',
          truck: 'TRK-001',
          containerNumbers: ['MSKU1234567', 'MSKU1234568'],
          port: 'Jebel Ali',
          cutOffDate: new Date('2024-01-10'),
          etd: new Date('2024-01-20'),
          transporter: 'Fast Logistics Ltd',
          status: 'in_transit',
          cellNumber: '+1234567890'
        },
        {
          date: new Date('2024-01-20'),
          jobNumber: 'JOB-002',
          invoiceNumber: 'INV-002',
          partyName: 'Sample Company Ltd',
          containerType: 'LCL',
          shippingLine: 'CMA CGM',
          destination: 'Singapore',
          vessel: 'CMA CGM Marco Polo',
          truck: 'TRK-002',
          containerNumbers: ['CMAU9876543'],
          port: 'Singapore',
          cutOffDate: new Date('2024-01-15'),
          etd: new Date('2024-01-25'),
          transporter: 'Fast Logistics Ltd',
          status: 'pending',
          cellNumber: '+1234567890'
        }
      ];

      await Job.insertMany(sampleJobs);
      console.log('✅ Sample jobs created (2 jobs)');
    }

    console.log('\n🎉 Database initialization completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('   Admin: admin@als.com / admin123');
    console.log('   Client: client@example.com / client123');
    console.log('   Vendor: vendor@example.com / vendor123');
    console.log('\n🚀 You can now start the application with: npm run dev');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

async function importJobsFromExcel(filePath) {
  try {
    const absPath = path.resolve(filePath);
    const workbook = XLSX.readFile(absPath);
    const sheetNames = workbook.SheetNames; // Parse all sheets
    let importedCount = 0;
    let createdClients = 0;
    for (const sheetName of sheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const rowsRaw = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      // Normalize header keys by trimming spaces
      const rows = rowsRaw.map(row => {
        const normalized = {};
        for (const key in row) {
          normalized[key.trim()] = row[key];
        }
        return normalized;
      });
      // Debug: print first 3 rows
      if (importedCount === 0) {
        console.log(`Sheet: ${sheetName} - First 3 parsed rows:`);
        console.log(rows.slice(0, 3));
      }
      for (const row of rows) {
        // Map Excel columns to Job schema
        const partyName = row['PARTY NAME'] ? String(row['PARTY NAME']).trim() : '';
        if (!partyName) continue;
        // Try to match partyName to an existing client
        let client = await User.findOne({ role: 'client', partyName });
        if (!client) {
          // Create a new client user
          // Generate a slug for email
          const slug = partyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          const email = `client+${slug}@als.com`;
          const password = await bcrypt.hash('client123', 12);
          client = new User({
            email,
            password,
            name: partyName,
            role: 'client',
            partyName,
            isActive: true
          });
          await client.save();
          createdClients++;
          console.log(`✅ Created new client: ${partyName} (${email})`);
        }
        // Determine containerType from CTNS, FCL, LCL columns
        let containerType = '';
        if (row['CTNS'] && String(row['CTNS']).trim()) containerType = 'CTNS';
        else if (row['FCL'] && String(row['FCL']).trim()) containerType = 'FCL';
        else if (row['LCL'] && String(row['LCL']).trim()) containerType = 'LCL';
        else containerType = 'FCL'; // fallback default
        const jobData = {
          date: row['DATE'] ? new Date(row['DATE']) : new Date(),
          jobNumber: row['JOB #'] || '',
          invoiceNumber: row['INV #'] || '',
          partyName,
          containerType,
          shippingLine: row['S.LINE'] || '',
          destination: row['DESTINATION'] || '',
          vessel: row['VESSEL'] || '',
          truck: row['TRUCK'] || '',
          containerNumbers: (row['CONTAINER #'] ? String(row['CONTAINER #']).split(/\r?\n|,|;/).map(s => s.trim()).filter(Boolean) : []),
          port: row['PORT'] || '',
          cutOffDate: row['CUT OFF & ETD'] ? new Date(row['CUT OFF & ETD']) : new Date(),
          etd: row['CUT OFF & ETD'] ? new Date(row['CUT OFF & ETD']) : new Date(),
          vehicleAtd: row['VEHICLE ATD'] ? new Date(row['VEHICLE ATD']) : undefined,
          vehicleArrv: row['VEHICLE ARRV'] ? new Date(row['VEHICLE ARRV']) : undefined,
          transporter: row['TRANSPORTER / REMARKS'] || '',
          remarks: row['IF ANY REMARKS'] || '',
          cellNumber: row['CELL #'] || '',
          status: 'pending',
        };
        await Job.create(jobData);
        importedCount++;
      }
    }
    console.log(`\n✅ Imported ${importedCount} jobs from Excel file: ${filePath}`);
    console.log(`✅ Created ${createdClients} new clients from Excel file: ${filePath}`);
  } catch (err) {
    console.error('❌ Excel import failed:', err);
  }
}

// Automatically run import if an Excel file exists in the root directory
const excelFiles = fs.readdirSync('.').filter(f => f.match(/\.xlsx$/i));
if (excelFiles.length > 0) {
  // Use the first Excel file found
  initDatabase().then(() => importJobsFromExcel(excelFiles[0]));
} else {
  initDatabase();
} 