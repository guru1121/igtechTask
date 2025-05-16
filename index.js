const express = require('express');
const puppeteer = require ('puppeteer');
const fs = require('fs');
const ejs = require('ejs');
const path = require('path');

const app = express();
app.use(express.json());
const port = 4000;

app.get('/', (req, res)=>{
    res.json({message: "hello !"})
});

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', ejs);
app.set('views', path.join(__dirname, 'templates'))

app.post('/genpdf',async(req, res)=>{
    console.log('genpdf route hit');
    const data = req.body;

    try {
        const html = await ejs.renderFile(
            path.join(__dirname, 'templates', 'pdf-template.ejs'),
            {data}
        )
        const browser = await puppeteer.launch({
            headless:'new'
        });
        const page = await browser.newPage();
        await page.setContent(html, {waitUntil: 'networkidle0'});

        const pdfDir = path.join(__dirname, 'generatedPdf');
        if(!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir);

        const pdfPath = path.join(pdfDir, `${Date.now()}_document.pdf`);

        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true
        })

        await browser.close();
        res.status(200).json({message: 'PDF generated successfully', path: pdfPath})
    }
    catch(err){
     console.err('PDF generation Failed',err);
     res.status(500).json({error: 'Failed to generate'})
    }
})

app.listen(port, ()=>{
    console.log(`app is running at http://localhost:${port}`);
})