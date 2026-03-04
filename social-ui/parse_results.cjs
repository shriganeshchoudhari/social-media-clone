const fs = require('fs');
try {
    let data = fs.readFileSync('phase5_report.json', 'utf16le');
    if (data.charCodeAt(0) === 0xFEFF) {
        data = data.slice(1);
    }
    const r = JSON.parse(data);
    let failed = [];
    r.suites?.forEach(s => {
        s.specs?.forEach(sp => {
            const results = sp.tests[0].results;
            if (results && results.length > 0) {
                const st = results[0].status;
                if (st !== 'expected' && st !== 'skipped') {
                    failed.push(`[${st}] ${s.title} > ${sp.title}\nError: ${results[0].error?.message?.substring(0, 200)}`);
                }
            }
        });
    });
    if (failed.length > 0) {
        console.log('FAILED TESTS:\n' + failed.join('\n\n'));
    } else {
        console.log('ALL TESTS PASSED OR SKIPPED!');
    }
} catch (e) {
    console.log('Error parsing JSON:', e.message);
}
