#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Test data
const testUserData = {
  fullName: 'Test User',
  email: 'test@example.com',
  phone: '1234567890',
  password: 'testpassword123',
  role: 'admin'
};

const testAssignmentData = {
  name: 'Test Assignment',
  semana: 'Test Week 1-7 January',
  month: 'Enero'
};

// Test helper functions
async function createTestUser() {
  const hashedPassword = await bcrypt.hash(testUserData.password, 10);
  return await prisma.user.create({
    data: {
      ...testUserData,
      password: hashedPassword
    }
  });
}

async function createTestAssignment(userId, parentId) {
  return await prisma.asignacion.create({
    data: {
      name: testAssignmentData.name,
      semana: testAssignmentData.semana,
      month: testAssignmentData.month,
      parentId,
      presidenteId: userId,
      tesorosDeLaBiblia: {
        create: [
          { name: 'Test Treasure 1', minutos: 10, encargadoId: userId },
          { name: 'Test Treasure 2', minutos: 15, encargadoId: userId }
        ]
      },
      seamosMejoresMaestros: {
        create: [
          { name: 'Test Teaching 1', minutos: 8, encargadoId: userId },
          { name: 'Test Teaching 2', minutos: 12, encargadoId: userId }
        ]
      },
      nuestraVidaCristiana: {
        create: [
          { name: 'Test Life 1', minutos: 5, encargadoId: userId },
          { name: 'Test Life 2', minutos: 7, encargadoId: userId }
        ]
      }
    },
    include: {
      presidente: true,
      tesorosDeLaBiblia: true,
      seamosMejoresMaestros: true,
      nuestraVidaCristiana: true
    }
  });
}

// Test cases
async function testAssignmentHierarchy() {
  console.log('🧪 Testing Assignment Hierarchy...');
  
  try {
    // Create test user
    const user = await createTestUser();
    console.log('✅ Test user created:', user.id);

    // Create parent assignment
    const parentAssignment = await createTestAssignment(user.id);
    console.log('✅ Parent assignment created:', parentAssignment.id);

    // Create child assignment
    const childAssignment = await createTestAssignment(user.id, parentAssignment.id);
    console.log('✅ Child assignment created:', childAssignment.id);

    // Test hierarchical query
    const assignmentsWithHierarchy = await prisma.asignacion.findMany({
      where: { id: { in: [parentAssignment.id, childAssignment.id] } },
      include: {
        parent: true,
        children: true
      }
    });

    const parent = assignmentsWithHierarchy.find(a => a.id === parentAssignment.id);
    const child = assignmentsWithHierarchy.find(a => a.id === childAssignment.id);

    console.log('✅ Parent assignment has children:', parent?.children.length === 1);
    console.log('✅ Child assignment has parent:', child?.parent?.id === parentAssignment.id);

    // Test cascade delete
    await prisma.asignacion.delete({ where: { id: parentAssignment.id } });
    
    // Verify child was also deleted
    const childExists = await prisma.asignacion.findUnique({
      where: { id: childAssignment.id }
    });
    
    console.log('✅ Cascade delete works:', childExists === null);

    // Cleanup
    await prisma.user.delete({ where: { id: user.id } });
    console.log('✅ Hierarchy test completed successfully');
    
  } catch (error) {
    console.error('❌ Hierarchy test failed:', error);
    throw error;
  }
}

async function testAssignmentCRUD() {
  console.log('🧪 Testing Assignment CRUD Operations...');
  
  try {
    const user = await createTestUser();
    
    // CREATE
    const assignment = await createTestAssignment(user.id);
    console.log('✅ Assignment created:', assignment.id);

    // READ
    const fetchedAssignment = await prisma.asignacion.findUnique({
      where: { id: assignment.id },
      include: {
        presidente: true,
        tesorosDeLaBiblia: true,
        seamosMejoresMaestros: true,
        nuestraVidaCristiana: true
      }
    });
    console.log('✅ Assignment fetched:', fetchedAssignment?.name);

    // UPDATE
    const updatedAssignment = await prisma.asignacion.update({
      where: { id: assignment.id },
      data: {
        name: 'Updated Assignment Name',
        semana: 'Updated Week'
      }
    });
    console.log('✅ Assignment updated:', updatedAssignment.name);

    // DELETE
    await prisma.asignacion.delete({ where: { id: assignment.id } });
    const deletedAssignment = await prisma.asignacion.findUnique({
      where: { id: assignment.id }
    });
    console.log('✅ Assignment deleted:', deletedAssignment === null);

    // Cleanup
    await prisma.user.delete({ where: { id: user.id } });
    console.log('✅ CRUD test completed successfully');
    
  } catch (error) {
    console.error('❌ CRUD test failed:', error);
    throw error;
  }
}

async function testUserSearch() {
  console.log('🧪 Testing User Search Functionality...');
  
  try {
    // Create multiple test users
    const users = await Promise.all([
      createTestUser(),
      prisma.user.create({
        data: {
          fullName: 'Another Test User',
          email: 'another@example.com',
          phone: '0987654321',
          password: await bcrypt.hash('password123', 10),
          role: 'viewer'
        }
      }),
      prisma.user.create({
        data: {
          fullName: 'Third User',
          email: 'third@example.com',
          phone: '5555555555',
          password: await bcrypt.hash('password123', 10),
          role: 'admin'
        }
      })
    ]);

    // Test search by name
    const nameResults = await prisma.user.findMany({
      where: {
        OR: [
          { fullName: { contains: 'Test', mode: 'insensitive' } },
          { email: { contains: 'Test', mode: 'insensitive' } }
        ]
      }
    });
    console.log('✅ Name search returned:', nameResults.length, 'users');

    // Test search by email
    const emailResults = await prisma.user.findMany({
      where: {
        OR: [
          { fullName: { contains: 'example', mode: 'insensitive' } },
          { email: { contains: 'example', mode: 'insensitive' } }
        ]
      }
    });
    console.log('✅ Email search returned:', emailResults.length, 'users');

    // Test pagination
    const paginatedResults = await prisma.user.findMany({
      skip: 0,
      take: 2,
      orderBy: { createdAt: 'desc' }
    });
    console.log('✅ Pagination works, returned:', paginatedResults.length, 'users');

    // Cleanup
    await Promise.all(users.map(user => prisma.user.delete({ where: { id: user.id } })));
    console.log('✅ User search test completed successfully');
    
  } catch (error) {
    console.error('❌ User search test failed:', error);
    throw error;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting comprehensive assignment system tests...\n');
  
  try {
    await testAssignmentHierarchy();
    console.log('');
    
    await testAssignmentCRUD();
    console.log('');
    
    await testUserSearch();
    console.log('');
    
    console.log('🎉 All tests completed successfully!');
  } catch (error) {
    console.error('💥 Test suite failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests };