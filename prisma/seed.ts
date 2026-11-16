import { PrismaClient, PropertyType, PropertyStatus, TenantStatus, LeaseStatus, PaymentStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding real estate agency database with worksheet data...");

  // 1. Seed Landlords (P1 to P21)
  const landlordsData = [
    { code: "1", name: "John Smith", email: "john.smith1@gmail.com", phone: "+27 71 234 5671", comm: 10, agent: "Unknown" },
    { code: "2", name: "Sarah Johnson", email: "sarah.johnson2@gmail.com", phone: "+27 72 345 6782", comm: 12, agent: "PG" },
    { code: "3", name: "David Brown", email: "david.brown3@gmail.com", phone: "+27 73 456 7893", comm: 10, agent: "landlord", notes: "Wants to be told of ALL maintenance issues before commissioning contractor" },
    { code: "4", name: "Emily Davis", email: "emily.davis4@gmail.com", phone: "+27 74 567 8904", comm: 10, agent: "SL" },
    { code: "5", name: "Michael Wilson", email: "michael.wilson5@gmail.com", phone: "+27 75 678 9015", comm: 10, agent: "landlord", notes: "Has own handyman for small jobs" },
    { code: "6", name: "Jessica Taylor", email: "jessica.taylor6@gmail.com", phone: "+27 76 789 0126", comm: 10, agent: "Falg", notes: "Carried out bathroom renovations without me." },
    { code: "7", name: "Daniel Moore", email: "daniel.moore7@gmail.com", phone: "+27 77 890 1237", comm: 10, agent: "SL" },
    { code: "8", name: "Amanda White", email: "amanda.white8@gmail.com", phone: "+27 78 901 2348", comm: 10, agent: "SL" },
    { code: "9", name: "Ryan Thomas", email: "ryan.thomas9@gmail.com", phone: "+27 79 123 4569", comm: 10, agent: "Goldilocks" },
    { code: "10", name: "Olivia Martin", email: "olivia.martin10@gmail.com", phone: "+27 82 234 5670", comm: 10, agent: "MK" },
    { code: "11", name: "Jason Clark", email: "jason.clark11@gmail.com", phone: "+27 83 345 6781", comm: 10, agent: "SM" },
    { code: "12", name: "Chloe Walker", email: "chloe.walker12@gmail.com", phone: "+27 84 456 7892", comm: 12, agent: "SL" },
    { code: "13", name: "Matthew Hall", email: "matthew.hall13@gmail.com", phone: "+27 61 567 8903", comm: 14, agent: "PG" },
    { code: "14", name: "Sophia Allen", email: "sophia.allen14@gmail.com", phone: "+27 62 678 9014", comm: 12, agent: "Falg" },
    { code: "15", name: "Ethan Young", email: "ethan.young15@gmail.com", phone: "+27 63 789 0125", comm: 10, agent: "SL" },
    { code: "16", name: "Mia King", email: "mia.king16@gmail.com", phone: "+27 64 890 1236", comm: 10, agent: "Falg" },
    { code: "17", name: "Jacob Wright", email: "jacob.wright17@gmail.com", phone: "+27 65 901 2347", comm: 10, agent: "Unknown" },
    { code: "18", name: "Grace Scott", email: "grace.scott18@gmail.com", phone: "+27 66 123 4568", comm: 10, agent: "SL" },
    { code: "19", name: "Noah Green", email: "noah.green19@gmail.com", phone: "+27 67 234 5679", comm: 10, agent: "PG" },
    { code: "20", name: "Lily Adams", email: "lily.adams20@gmail.com", phone: "+27 68 345 6780", comm: 10, agent: "Prop Group" },
    { code: "21", name: "Benjamin Lee", email: "benjamin.lee21@gmail.com", phone: "+27 69 456 7891", comm: 12, agent: "SL" },
  ];

  const landlordMap = new Map<string, number>();

  for (const l of landlordsData) {
    const record = await prisma.landlord.upsert({
      where: { email: l.email },
      update: {
        displayName: l.name,
        phoneNumber: l.phone,
        commissionRate: l.comm,
        notes: l.notes || null,
      },
      create: {
        displayName: l.name,
        email: l.email,
        phoneNumber: l.phone,
        commissionRate: l.comm,
        notes: l.notes || null,
      },
    });
    landlordMap.set(l.code, record.id);
  }

  console.log(`✓ Seeded ${landlordMap.size} landlords`);

  // 2. Seed Main Properties (P1 to P21)
  const mainProperties = [
    { code: "1", name: "10 Arenas", address: "10 Arenas, Kenilworth", city: "Cape Town", price: 11200 },
    { code: "2", name: "10 Dunvegan", address: "10 Dunvegan gardens, 5 Hope road, Rosebank", city: "Cape Town", price: 18750 },
    { code: "3", name: "10 Matthews", address: "10 Matthew road, Claremont", city: "Cape Town", price: 19300 },
    { code: "4", name: "10 Rouwkoop", address: "10 Rouwkoop Mansions, 51 Rouwkoop road, Rondebosch", city: "Cape Town", price: 11000 },
    { code: "5", name: "19 Queen", address: "19 Queen street, Mowbray", city: "Cape Town", price: 24500 },
    { code: "6", name: "205 Mt Royal", address: "205 Mt Royal", city: "Cape Town", price: 10450 },
    { code: "7", name: "23 Rose", address: "23 Rosehope apartments, 15 Main road, Rosebank", city: "Cape Town", price: 13600 },
    { code: "8", name: "24 Palm", address: "24 Palm mews, 20 Falmouth road, Observatory", city: "Cape Town", price: 13000 },
    { code: "9", name: "24 San Bernado", address: "24 San Bernado", city: "Cape Town", price: 23500 },
    { code: "10", name: "31 Berkley", address: "31 Berkley square, 173 Main road, Newlands", city: "Cape Town", price: 11000 },
    { code: "11", name: "31 Rhodes", address: "31 Rhodes Manor, 6 Phillips road, Rondebosch", city: "Cape Town", price: 21000 },
    { code: "12", name: "3 Beck", address: "3 Beckenham Mansions, 14 Nursery road, Rondebosch", city: "Cape Town", price: 18750 },
    { code: "13", name: "3 Dunvegan", address: "3 Dunvegan gardens, 5 Hope road, Rosebank", city: "Cape Town", price: 18900 },
    { code: "14", name: "403 Riv", address: "403 Riviera, 1 George street, Observatory", city: "Cape Town", price: 15000 },
    { code: "15", name: "44 Rose", address: "44 Rosehope apartments, 15 Main road, Rosebank", city: "Cape Town", price: 9000 },
    { code: "16", name: "504 Riv", address: "504 Riviera, 1 George street, Observatory", city: "Cape Town", price: 17250 },
    { code: "17", name: "64 Ronde", address: "64 Rondebosch Oaks, Rondebosch", city: "Cape Town", price: 10000 },
    { code: "18", name: "6 Beck", address: "6 Beckenham Mansions, 14 Nursery road, Rondebosch", city: "Cape Town", price: 18750 },
    { code: "19", name: "9 Volt", address: "9 Volterra, 9 Upper Durban Road, Mowbray", city: "Cape Town", price: 19000 },
    { code: "20", name: "A6 Cornhill", address: "A6 Cornhill gardens, Kenilworth", city: "Cape Town", price: 11200 },
    { code: "21", name: "H7 Norman", address: "H7 Normanhurst, Seapoint", city: "Cape Town", price: 23500 },
  ];

  const propertyMap = new Map<string, number>();

  for (const p of mainProperties) {
    const landlordId = landlordMap.get(p.code) || null;
    const record = await prisma.property.upsert({
      where: { propertyCode: p.code },
      update: {
        propertyName: p.name,
        address: p.address,
        city: p.city,
        price: p.price,
        landlordId,
      },
      create: {
        propertyCode: p.code,
        propertyName: p.name,
        address: p.address,
        city: p.city,
        propertyType: PropertyType.APARTMENT,
        status: PropertyStatus.OCCUPIED,
        price: p.price,
        landlordId,
      },
    });
    propertyMap.set(p.code, record.id);
  }

  console.log(`✓ Seeded ${propertyMap.size} main properties`);

  // 3. Seed Sub-Properties / Sub-divisions (e.g. 2.1, 2.2, 2.3, 5.1, etc.)
  const subProperties = [
    { code: "2.1", parentCode: "2", name: "10 Dunvegan - Unit 1", price: 6250 },
    { code: "2.2", parentCode: "2", name: "10 Dunvegan - Unit 2", price: 6000 },
    { code: "2.3", parentCode: "2", name: "10 Dunvegan - Unit 3", price: 6500 },

    { code: "5.1", parentCode: "5", name: "19 Queen - Unit 1", price: 6000 },
    { code: "5.2", parentCode: "5", name: "19 Queen - Unit 2", price: 6000 },
    { code: "5.3", parentCode: "5", name: "19 Queen - Unit 3", price: 6500 },
    { code: "5.4", parentCode: "5", name: "19 Queen - Unit 4", price: 6500 },

    { code: "7.1", parentCode: "7", name: "23 Rose - Unit 1", price: 6600 },
    { code: "7.2", parentCode: "7", name: "23 Rose - Unit 2", price: 7000 },

    { code: "8.1", parentCode: "8", name: "24 Palm - Unit 1", price: 6500 },
    { code: "8.2", parentCode: "8", name: "24 Palm - Unit 2", price: 6500 },

    { code: "11.1", parentCode: "11", name: "31 Rhodes - Unit 1", price: 6500 },
    { code: "11.2", parentCode: "11", name: "31 Rhodes - Unit 2", price: 7000 },
    { code: "11.3", parentCode: "11", name: "31 Rhodes - Unit 3", price: 7500 },

    { code: "12.1", parentCode: "12", name: "3 Beck - Unit 1", price: 6250 },
    { code: "12.2", parentCode: "12", name: "3 Beck - Unit 2", price: 6250, status: PropertyStatus.AVAILABLE },
    { code: "12.3", parentCode: "12", name: "3 Beck - Unit 3", price: 6250 },

    { code: "13.1", parentCode: "13", name: "3 Dunvegan - Unit 1", price: 6000 },
    { code: "13.2", parentCode: "13", name: "3 Dunvegan - Unit 2", price: 6400 },
    { code: "13.3", parentCode: "13", name: "3 Dunvegan - Unit 3", price: 6500 },

    { code: "16.1", parentCode: "16", name: "504 Riv - Unit 1", price: 5000 },
    { code: "16.2", parentCode: "16", name: "504 Riv - Unit 2", price: 6250 },
    { code: "16.3", parentCode: "16", name: "504 Riv - Unit 3", price: 6000 },

    { code: "18.1", parentCode: "18", name: "6 Beck - Unit 1", price: 6250 },
    { code: "18.2", parentCode: "18", name: "6 Beck - Unit 2", price: 6250 },
    { code: "18.3", parentCode: "18", name: "6 Beck - Unit 3", price: 6250 },

    { code: "19.1", parentCode: "19", name: "9 Volt - Unit 1", price: 6500 },
    { code: "19.2", parentCode: "19", name: "9 Volt - Unit 2", price: 6000 },
    { code: "19.3", parentCode: "19", name: "9 Volt - Unit 3", price: 6500 },
  ];

  for (const s of subProperties) {
    const parentId = propertyMap.get(s.parentCode);
    const parentProp = mainProperties.find((m) => m.code === s.parentCode);

    const record = await prisma.property.upsert({
      where: { propertyCode: s.code },
      update: {
        propertyName: s.name,
        address: `${parentProp?.address || ""} [Unit ${s.code}]`,
        city: "Cape Town",
        price: s.price,
        parentPropertyId: parentId || null,
        status: s.status || PropertyStatus.OCCUPIED,
      },
      create: {
        propertyCode: s.code,
        propertyName: s.name,
        address: `${parentProp?.address || ""} [Unit ${s.code}]`,
        city: "Cape Town",
        propertyType: PropertyType.APARTMENT,
        status: s.status || PropertyStatus.OCCUPIED,
        price: s.price,
        parentPropertyId: parentId || null,
      },
    });
    propertyMap.set(s.code, record.id);
  }

  console.log(`✓ Seeded ${subProperties.length} sub-properties`);

  // 4. Seed Tenants and Active Leases
  const leasesData = [
    { propCode: "1", first: "Junior John", last: "Smith", phone: "+27 72 451 2087", email: "john.smith@gmail.com", start: "2026-09-01", end: "2027-08-31", rent: 11200, status: LeaseStatus.ACTIVE },
    { propCode: "2.1", first: "Sarah", last: "Jones", phone: "+27 73 562 3198", email: "sarah.jones@gmail.com", start: "2026-04-01", end: "2027-01-31", rent: 6250, status: LeaseStatus.ACTIVE },
    { propCode: "2.2", first: "Michael", last: "Brown", phone: "+27 74 673 4209", email: "michael.brown@gmail.com", start: "2025-12-01", end: "2026-11-30", rent: 6000, status: LeaseStatus.EXPIRING_SOON },
    { propCode: "2.3", first: "Emily", last: "Davis", phone: "+27 76 784 5310", email: "emily.davis@gmail.com", start: "2026-04-01", end: "2027-03-31", rent: 6500, status: LeaseStatus.ACTIVE },
    { propCode: "3", first: "David", last: "Wilson", phone: "+27 78 895 6421", email: "david.wilson@gmail.com", start: "2026-09-01", end: "2027-08-31", rent: 19300, status: LeaseStatus.ACTIVE },
    { propCode: "4", first: "Jessica", last: "Taylor", phone: "+27 61 906 7532", email: "jessica.taylor@gmail.com", start: "2026-02-01", end: "2027-01-31", rent: 11000, status: LeaseStatus.ACTIVE },
    { propCode: "5.1", first: "Daniel", last: "Clark", phone: "+27 62 117 8643", email: "daniel.clark@gmail.com", start: "2026-04-01", end: "2027-01-31", rent: 6000, status: LeaseStatus.ACTIVE },
    { propCode: "5.2", first: "Olivia", last: "White", phone: "+27 63 228 9754", email: "olivia.white@gmail.com", start: "2026-04-01", end: "2027-01-31", rent: 6000, status: LeaseStatus.ACTIVE },
    { propCode: "5.3", first: "Ryan", last: "Hall", phone: "+27 64 339 0865", email: "ryan.hall@gmail.com", start: "2026-08-01", end: "2027-01-31", rent: 6500, status: LeaseStatus.ACTIVE },
    { propCode: "5.4", first: "Megan", last: "Scott", phone: "+27 65 440 1976", email: "megan.scott@gmail.com", start: "2025-12-01", end: "2026-12-31", rent: 6500, status: LeaseStatus.EXPIRING_SOON },
    { propCode: "6", first: "Ethan", last: "King", phone: "+27 66 551 2087", email: "ethan.king@gmail.com", start: "2026-01-01", end: "2026-12-31", rent: 10450, status: LeaseStatus.EXPIRING_SOON, notes: "Moving out 30 Oct. Landlords renovating in November." },
    { propCode: "7.1", first: "Chloe", last: "Adams", phone: "+27 67 662 3198", email: "chloe.adams@gmail.com", start: "2026-01-01", end: "2026-12-31", rent: 6600, status: LeaseStatus.EXPIRING_SOON },
    { propCode: "7.2", first: "Matthew", last: "Green", phone: "+27 68 773 4209", email: "matthew.green@gmail.com", start: "2026-02-01", end: "2026-12-31", rent: 7000, status: LeaseStatus.EXPIRING_SOON },
    { propCode: "8.1", first: "Lauren", last: "Baker", phone: "+27 69 884 5310", email: "lauren.baker@gmail.com", start: "2026-03-01", end: "2027-01-31", rent: 6500, status: LeaseStatus.ACTIVE },
    { propCode: "8.2", first: "Nathan", last: "Hill", phone: "+27 71 995 6421", email: "nathan.hill@gmail.com", start: "2026-08-01", end: "2027-01-31", rent: 6500, status: LeaseStatus.ACTIVE },
    { propCode: "9", first: "Ava", last: "Young", phone: "+27 72 106 7532", email: "ava.young@gmail.com", start: "2026-07-01", end: "2027-06-30", rent: 23500, status: LeaseStatus.ACTIVE },
    { propCode: "10", first: "Jason", last: "Lee", phone: "+27 73 217 8643", email: "jason.lee@gmail.com", start: "2026-01-01", end: "2026-12-31", rent: 11000, status: LeaseStatus.EXPIRING_SOON },
    { propCode: "11.1", first: "Rachel", last: "Moore", phone: "+27 74 328 9754", email: "rachel.moore@gmail.com", start: "2026-02-14", end: "2027-01-31", rent: 6500, status: LeaseStatus.ACTIVE },
    { propCode: "11.2", first: "Tyler", last: "Martin", phone: "+27 75 439 0865", email: "tyler.martin@gmail.com", start: "2026-02-08", end: "2027-01-31", rent: 7000, status: LeaseStatus.ACTIVE },
    { propCode: "11.3", first: "Sophia", last: "Allen", phone: "+27 76 540 1976", email: "sophia.allen@gmail.com", start: "2026-02-14", end: "2027-01-31", rent: 7500, status: LeaseStatus.ACTIVE },
    { propCode: "12.1", first: "Brandon", last: "Harris", phone: "+27 77 651 2087", email: "brandon.harris@gmail.com", start: "2025-12-01", end: "2026-11-30", rent: 6250, status: LeaseStatus.EXPIRING_SOON },
    { propCode: "12.3", first: "Justin", last: "Walker", phone: "+27 61 873 4209", email: "justin.walker@gmail.com", start: "2026-01-01", end: "2026-12-31", rent: 6250, status: LeaseStatus.EXPIRING_SOON },
    { propCode: "13.1", first: "Hannah", last: "Wright", phone: "+27 62 984 5310", email: "hannah.wright@gmail.com", start: "2026-02-01", end: "2027-01-31", rent: 6000, status: LeaseStatus.ACTIVE },
    { propCode: "13.2", first: "Aaron", last: "Cooper", phone: "+27 63 195 6421", email: "aaron.cooper@gmail.com", start: "2026-01-01", end: "2026-12-31", rent: 6400, status: LeaseStatus.EXPIRING_SOON },
    { propCode: "13.3", first: "Leah", last: "Carter", phone: "+27 64 206 7532", email: "leah.carter@gmail.com", start: "2026-02-01", end: "2027-01-31", rent: 6500, status: LeaseStatus.ACTIVE },
    { propCode: "14", first: "Kyle", last: "Turner", phone: "+27 65 317 8643", email: "kyle.turner@gmail.com", start: "2026-06-01", end: "2026-12-31", rent: 15000, status: LeaseStatus.EXPIRING_SOON },
    { propCode: "15", first: "Brooke", last: "Evans", phone: "+27 66 428 9754", email: "brooke.evans@gmail.com", start: "2026-04-01", end: "2027-01-31", rent: 9000, status: LeaseStatus.ACTIVE },
    { propCode: "16.1", first: "Adam", last: "Phillips", phone: "+27 67 539 0865", email: "adam.phillips@gmail.com", start: "2026-01-01", end: "2026-12-31", rent: 5000, status: LeaseStatus.EXPIRING_SOON },
    { propCode: "16.2", first: "Zoe", last: "Parker", phone: "+27 68 640 1976", email: "zoe.parker@gmail.com", start: "2026-02-01", end: "2026-12-31", rent: 6250, status: LeaseStatus.EXPIRING_SOON },
    { propCode: "16.3", first: "Sean", last: "Collins", phone: "+27 69 751 2087", email: "sean.collins@gmail.com", start: "2026-01-01", end: "2026-12-31", rent: 6000, status: LeaseStatus.EXPIRING_SOON },
    { propCode: "17", first: "Lily", last: "Stewart", phone: "+27 71 862 3198", email: "lily.stewart@gmail.com", start: "2025-12-01", end: "2026-11-30", rent: 10000, status: LeaseStatus.EXPIRING_SOON },
    { propCode: "18.1", first: "Connor", last: "Reed", phone: "+27 72 973 4209", email: "connor.reed@gmail.com", start: "2026-01-01", end: "2027-01-31", rent: 6250, status: LeaseStatus.ACTIVE },
    { propCode: "18.2", first: "Mia", last: "Cook", phone: "+27 73 184 5310", email: "mia.cook@gmail.com", start: "2026-02-01", end: "2027-01-31", rent: 6250, status: LeaseStatus.ACTIVE },
    { propCode: "18.3", first: "Blake", last: "Morgan", phone: "+27 74 295 6421", email: "blake.morgan@gmail.com", start: "2026-02-01", end: "2027-01-31", rent: 6250, status: LeaseStatus.ACTIVE },
    { propCode: "19.1", first: "Ruby", last: "Bell", phone: "+27 75 306 7532", email: "ruby.bell@gmail.com", start: "2026-01-01", end: "2026-12-31", rent: 6500, status: LeaseStatus.EXPIRING_SOON },
    { propCode: "19.2", first: "Logan", last: "Murphy", phone: "+27 76 417 8643", email: "logan.murphy@gmail.com", start: "2026-01-01", end: "2026-12-31", rent: 6000, status: LeaseStatus.EXPIRING_SOON },
    { propCode: "19.3", first: "Eva", last: "Bailey", phone: "+27 77 528 9754", email: "eva.bailey@gmail.com", start: "2026-01-01", end: "2026-12-31", rent: 6500, status: LeaseStatus.EXPIRING_SOON },
    { propCode: "20", first: "Caleb", last: "Foster", phone: "+27 78 639 0865", email: "caleb.foster@gmail.com", start: "2026-01-01", end: "2026-12-31", rent: 11200, status: LeaseStatus.EXPIRING_SOON },
    { propCode: "21", first: "Paige", last: "Ross", phone: "+27 61 740 1976", email: "paige.ross@gmail.com", start: "2025-12-01", end: "2026-11-30", rent: 23500, status: LeaseStatus.EXPIRING_SOON },
  ];

  for (const l of leasesData) {
    const propId = propertyMap.get(l.propCode);
    if (!propId) continue;

    // Create or update tenant
    const tenant = await prisma.tenant.upsert({
      where: { email: l.email },
      update: {
        firstName: l.first,
        lastName: l.last,
        phoneNumber: l.phone,
        propertyId: propId,
        status: TenantStatus.ACTIVE,
      },
      create: {
        firstName: l.first,
        lastName: l.last,
        email: l.email,
        phoneNumber: l.phone,
        propertyId: propId,
        status: TenantStatus.ACTIVE,
      },
    });

    // Create active lease
    const lease = await prisma.lease.create({
      data: {
        propertyId: propId,
        tenantId: tenant.id,
        startDate: new Date(l.start),
        endDate: new Date(l.end),
        monthlyRent: l.rent,
        status: l.status,
        leaseReference: l.notes || `Lease for Unit ${l.propCode}`,
      },
    });

    // Create rent payment record for October 2026 as marked in worksheet
    await prisma.rentPayment.create({
      data: {
        leaseId: lease.id,
        month: 10,
        year: 2026,
        amountDue: l.rent,
        amountPaid: l.rent,
        paymentDate: new Date("2026-10-01"),
        status: PaymentStatus.PAID,
      },
    });
  }

  console.log(`✓ Seeded ${leasesData.length} tenants, leases, and October rent payments`);

  // 5. Seed Contractors
  const contractorsData = [
    { name: "Vinny", spec: "Handyman", phone: "+27 71 564 2311", desc: "Blocked toilet. Lock and key change. Lightbulbs" },
    { name: "Laulau", spec: "Handyman", phone: "+27 15 642 3125", desc: "Mould. Wall cracks. Lock and key change. Lightbulbs" },
    { name: "Mickey Projects", spec: "Handyman", phone: "+28 46 125 9562", desc: "Painting." },
    { name: "Traddelong", spec: "Plumbers", phone: "+27 12 345 6987", desc: "Plumbing services." },
    { name: "6 Peaks", spec: "Plumbers", phone: "+27 12 345 6978", desc: "Geyser replacement." },
    { name: "Mr Plumner", spec: "Plumbers", phone: "+27 23 456 9874", desc: "Takura Sekuru Goddie" },
    { name: "SV electrical", spec: "Electricians", phone: "+27 68 234 5697", desc: "Electrical installations and repairs" },
    { name: "Mrs Locks", spec: "Locksmith", phone: "+27 96 385 274", desc: "Lock and key replacements" },
    { name: "Otis", spec: "Woodwork", phone: "+27 14 785 2369", desc: "Floor varnishing and doors" },
    { name: "Tim- Eliminator", spec: "Pest control", phone: "+54 78 961 254", desc: "Cockroaches and spiders eradication" },
    { name: "Trucker", spec: "Truck transport", phone: "+57 84 123 6987", desc: "T35 truck with canopy for dumpsite runs" },
  ];

  for (const c of contractorsData) {
    await prisma.contractor.create({
      data: {
        contractorName: c.name,
        speciality: c.spec,
        phoneNumber: c.phone,
        description: c.desc,
      },
    });
  }

  console.log(`✓ Seeded ${contractorsData.length} contractors`);

  // 6. Seed 25th Rates and Levies Accounts with 12 monthly entries for 2026
  const ratesLeviesAccounts = [
    {
      propCode: "8",
      name: "City of Cape Town",
      category: "Municipal rates",
      entries: [1400.00, 1223.62, 1273.48, 1447.64, 1302.50, 1273.48, 1289.88, 1324.27, 1215.18, 1250.00, 1250.00, 1250.00],
    },
    {
      propCode: "8",
      name: "Body Corporate",
      category: "Levy",
      entries: [3388.82, 3542.78, 3542.78, 3542.78, 3542.78, 3542.78, 3542.78, 3542.78, 3542.78, 3542.78, 3542.78, 3542.78],
    },
    {
      propCode: "20",
      name: "Body Corporate",
      category: "Levy",
      entries: [2901.68, 2901.68, 2901.68, 2901.68, 2901.68, 2901.68, 2901.68, 2901.68, 2901.68, 2901.68, 2901.68, 2901.68],
    },
    {
      propCode: "20",
      name: "City of Cape Town",
      category: "Municipal rates",
      entries: [1241.27, 1125.54, 1102.42, 1241.27, 1125.54, 1102.42, 1201.20, 1329.26, 1270.88, 1250.00, 1250.00, 1250.00],
    },
    {
      propCode: "6",
      name: "City of Cape Town",
      category: "Municipal rates",
      entries: [1200.00, 1300.00, 844.20, 934.22, 859.20, 900.00, 900.00, 900.00, 900.00, 900.00, 900.00, 900.00],
    },
    {
      propCode: "6",
      name: "Body Corporate",
      category: "Levy",
      entries: [2201.36, 2201.36, 2201.36, 2201.36, 4431.47, 2201.36, 2201.36, 2201.36, 2201.36, 2201.36, 2201.36, 2201.36],
    },
  ];

  for (const acc of ratesLeviesAccounts) {
    const propId = propertyMap.get(acc.propCode);
    if (!propId) continue;

    const record = await prisma.ratesAndLevy.create({
      data: {
        propertyId: propId,
        accountName: `${acc.name} (${acc.category})`,
        accountNumber: `ACC-${acc.propCode}-${acc.category.slice(0, 3).toUpperCase()}`,
        notes: `Due 25th of every month`,
      },
    });

    for (let month = 1; month <= 12; month++) {
      const amt = acc.entries[month - 1] || 1500;
      await prisma.ratesAndLevyEntry.create({
        data: {
          ratesAndLevyId: record.id,
          month,
          year: 2026,
          amount: amt,
          dueDate: new Date(2026, month - 1, 25),
          paid: month <= 10, // Jan-Oct paid as in worksheet
          paidDate: month <= 10 ? new Date(2026, month - 1, 25) : null,
        },
      });
    }
  }

  console.log(`✓ Seeded 25th Rates & Levies accounts with full 12-month entries`);
  console.log("Database successfully seeded!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

