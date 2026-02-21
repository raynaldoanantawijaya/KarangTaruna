
const baseUrl = 'http://127.0.0.1:3000/api/admin/content';

async function testApi() {
    console.log('--- Starting API Test ---');

    // 1. Create Draft
    console.log('\n1. Creating Draft...');
    const createRes = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: 'Test API Post',
            content: '<p>This is a test post from script.</p>',
            status: 'draft',
            author: 'Script Tester'
        })
    });

    if (!createRes.ok) {
        console.error('Failed to create draft:', createRes.status, await createRes.text());
        return;
    }

    const createData = await createRes.json();
    console.log('Draft Created:', createData);
    const newItem = createData.data[0]; // API returns updated list, so first item is new?
    // Wait, let's check API implementation. 
    // "data.unshift(newItem); return NextResponse.json({ success: true, data });" 
    // It returns the WHOLE list. Arrays.unshift puts it at 0.

    if (!newItem) {
        console.error('No data returned');
        return;
    }

    const id = newItem.id;
    const slug = newItem.slug;
    console.log(`ID: ${id}, Slug: ${slug}`);

    // 2. Read by Slug
    console.log(`\n2. Reading by Slug: ${slug}...`);
    const readRes = await fetch(`${baseUrl}?slug=${slug}`);
    if (!readRes.ok) {
        console.error('Failed to read by slug');
        return;
    }
    const readData = await readRes.json();
    console.log('Read Result Pattern:', readData.title);

    // 3. Publish (Update)
    console.log('\n3. Publishing...');
    const updateRes = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: id,
            status: 'published'
        })
    });

    if (!updateRes.ok) {
        console.error('Failed to update');
        return;
    }

    // 4. Verify Published
    const verifyRes = await fetch(`${baseUrl}?id=${id}`);
    const verifyData = await verifyRes.json();
    console.log('Final Status:', verifyData.status);

    if (verifyData.status === 'published') {
        console.log('\n--- TEST PASSED ---');
    } else {
        console.log('\n--- TEST FAILED ---');
    }
}

testApi().catch(console.error);
