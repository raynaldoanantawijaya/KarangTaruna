
const fetch = require('node-fetch');

const BASE_URL = 'http://127.0.0.1:3000/api/admin/content';

async function testDuplicates() {
    console.log('--- Starting Duplicate Post Test ---');

    // 1. Create a new post
    console.log('\n1. Creating Initial Draft...');
    const createRes = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: 'Test Post',
            content: '<p>Initial Content</p>',
            status: 'draft'
        })
    });
    const createData = await createRes.json();
    const postId = createData.data.id;
    console.log('Created ID:', postId);

    if (!postId) {
        console.error('Failed to create post');
        return;
    }

    // 2. Update the SAME post (simulate clicking "Save" again)
    console.log('\n2. Updating the same post...');
    const updateRes = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: postId, // IMPORTANT: Sending the ID back
            title: 'Test Post Updated',
            content: '<p>Updated Content</p>',
            status: 'draft'
        })
    });
    const updateData = await updateRes.json();
    console.log('Update Result:', updateData.success ? 'Success' : 'Failed');

    // 3. Verify count
    console.log('\n3. Verifying total posts...');
    const listRes = await fetch(BASE_URL);
    const listData = await listRes.json();
    console.log('Total Posts:', listData.length);
    console.log('Posts:', listData.map(p => ({ id: p.id, title: p.title })));

    if (listData.length === 1 && listData[0].title === 'Test Post Updated') {
        console.log('\n--- PASSED: Only 1 post exists and it was updated. ---');
    } else {
        console.error('\n--- FAILED: Expected 1 updated post, found', listData.length, '---');
    }
}

testDuplicates();
