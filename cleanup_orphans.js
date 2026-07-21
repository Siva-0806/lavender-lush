const fs = require('fs');

['public/index.html', 'public/collection.html'].forEach(f => {
  let content = fs.readFileSync(f, 'utf8');

  // We are looking for the exact duplicated orphaned code that was left behind by the bad regex.
  // We'll replace it using exact string matching to be perfectly safe.
  
  const orphanedCode = `
    const data = await res.json();
    if (data.success && data.urls && data.urls.length > 0) {
      document.getElementById('pfImage').value = data.urls[0];
      const preview = document.getElementById('pfImagePreview');
      preview.src = data.urls[0];
      preview.style.display = 'block';
      showToast('Image uploaded', 'check-circle');
    } else {
      showToast('Image upload failed', 'alert-circle');
    }
  } catch (err) {
    showToast('Error uploading image', 'alert-circle');
  }
});`;

  // Only remove it if it occurs directly after our correct logic
  // We can just find the index of the first occurrence of `imageUploadLogic` and then see if the orphaned code comes right after it.
  // Actually, we can just remove the orphaned code altogether IF it exists in addition to the correct listener.

  const correctListener = `document.getElementById('pfImageFile').addEventListener('change', async (e) => {`;
  
  if (content.includes(correctListener)) {
     // replace the orphaned code ONLY ONCE
     const regex = new RegExp(orphanedCode.replace(/[.*+?^\${}()|[\]\\]/g, '\\$&'), 'g');
     // But wait, what if the orphaned code is slightly indented?
     // Let's use a regex that matches the structure.
     
     const badRegex = /^\s*const data = await res\.json\(\);\s*if \(data\.success[\s\S]*?showToast\('Error uploading image', 'alert-circle'\);\s*\}\s*\}\);\s*/m;
     content = content.replace(badRegex, '');
  }

  fs.writeFileSync(f, content);
  console.log('Cleaned up ' + f);
});
