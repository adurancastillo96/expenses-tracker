// Happy coding

// Primeros pasos: carga el fichero JSON y muestra su contenido en la consola. Luego, ya puedes implementar la iteración 1. Para mostrar la fecha legible, puedes buscar por Chat GPT o por Google como convertir un timestamp
import fs from 'fs';
import path from 'path';

// Read JSON file
const content = fs.readFileSync('expenses.json', 'utf-8');

const expenses = JSON.parse(content);

const commands = process.argv.slice(2);

for (const command of commands) {
    if(command === '--list') {
        console.log('ID | Date | Concept | Category | Amount');
        console.log('=======================================');
        expenses.forEach(item => {//using arrow function
            displayExpense(item);
        });

    } else if(command === '--summary') {
        const total = expenses.reduce((sum, item) => sum + item.amount, 0); // for vs for .. of
        const roundedTotal = total.toFixed(2);
        console.log(`Total: ${roundedTotal}€`);
    } else if(command === '--filter-category') {
        const category = commands[1].toLowerCase();
        console.log('ID | Date | Concept | Category | Amount');
        console.log('=======================================');
        const filtered = expenses.filter(item => item.category === category);
        filtered.forEach(displayExpense);// without using arrow function
    } else if(command === '--find') {
        const ids = commands.slice(1);
        console.log('ID | Date | Concept | Category | Amount');
        console.log('=======================================');
        for (const id of ids) {
            const filtered = expenses.filter(item => item.id === parseInt(id));
            if (filtered.length === 0) {
                console.log(`⚠️  Item with ID ${id} not found.`);
            } else {
                filtered.forEach(displayExpense);// withour using arrow function
            }
        }
    } else if(command === '--add') {
        const id = expenses.length ? Math.max(...expenses.map(e => e.id)) + 1 : 1;// spread operator + ternary operator
        const timestamp = Math.floor(Date.now()/1000);
        const [concept, category, amount] = commands.slice(1,4);
        const newItem = {
            id: id,
            timestamp: timestamp,
            concept: concept,
            category: category,
            amount: parseFloat(amount)
        };
        expenses.push(newItem);
        fs.writeFileSync('expenses.json', JSON.stringify(expenses));
        console.log('Item added:');
        displayExpense(newItem);
    } else if(command === '--delete') {
        const ids = commands.slice(1);
        let found = false;
        ids.forEach(id => {
            for (const [index, item] of expenses.entries()) {
                if (item.id === parseInt(id)) {
                    console.log('Item to remove:', item);
                    expenses.splice(index, 1); // remove and store the new array
                    fs.writeFileSync('expenses.json', JSON.stringify(expenses));
                    found = true;
                    break; // exit loop once found                    
                }                 
            }
            if (!found) {
                found = false;
                console.log(`⚠️  Item with ID ${id} not found.`);
            }
        });
    } else if(command === '--export-file') {
        const newFiles = commands.slice(1); // files
        for (const filename of newFiles) {
            const ext = path.extname(filename).toLowerCase(); // extension
            let output = ''; // Format data to export. 'let' is important
            if (ext === '.csv') {
                output = [
                    'id,date,concept,category,amount',
                    ...expenses.map(item => {
                      const date = new Date(item.timestamp * 1000).toLocaleDateString();
                      return `${item.id},${date},${item.concept},${item.category},${item.amount}`;
                    })
                  ].join('\n');

                // Write to file
                fs.writeFileSync(filename, output);
                console.log(`✅ Exported file to ${filename}`);
            } else if (ext === '.txt') {
                output = [
                    'ID | Date | Concept | Category | Amount',
                    '=======================================',
                    ...expenses.map(item => {
                      const date = new Date(item.timestamp * 1000).toLocaleDateString();
                      return `#${item.id} | ${date} | ${item.concept} | ${item.category} | ${item.amount}€`;
                    })
                  ].join('\n');

                // Write to file
                fs.writeFileSync(filename, output);
                console.log(`✅ Exported file to ${filename}`);
            } else {
                console.log(`Error: No possible to export ${filename}`);
                console.log('❌ Unsupported file format. Use .csv or .txt');
            }
        }
    } 
}

function displayExpense(item) {
    const unixTimestamp = item.timestamp; //in seconds
    const localDate = new Date(unixTimestamp*1000).toLocaleDateString();
    console.log(`#${item.id} | ${localDate} | ${item.concept} | ${item.category} | ${item.amount}€`);
}