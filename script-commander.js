// Happy coding

// Primeros pasos: carga el fichero JSON y muestra su contenido en la consola. Luego, ya puedes implementar la iteración 1. Para mostrar la fecha legible, puedes buscar por Chat GPT o por Google como convertir un timestamp
import fs from 'fs';
import path from 'path';
import { Command } from 'commander';

// Read JSON file
const content = fs.readFileSync('expenses.json', 'utf-8');
const expenses = JSON.parse(content);

// Create a program
const program = new Command();

// Info
program
  .name('expense-cli')
  .description('CLI tool to manage expenses')
  .version('1.0.0');

// List
program
  .command('list')
  .description('List all items')
  .action(() => {
    console.log('ID | Date | Concept | Category | Amount');
    console.log('=======================================');
    expenses.forEach(displayExpense);
  });  

// Summary
program
  .command('summary')
  .description('Show total items')
  .action(() => {
    const total = expenses.reduce((sum, item) => sum + item.amount, 0);
    console.log(`Total: ${total.toFixed(2)}€`);
  });

// Filter Category
program
  .command('filter-category <category>')
  .description('Filter items by category')
  .action((category) => {
    console.log('ID | Date | Concept | Category | Amount');
    console.log('=======================================');
    expenses
      .filter(item => item.category === category.toLowerCase())
      .forEach(displayExpense);
  });

// Find IDs
program
  .command('find <ids...>')
  .description('Find items by ID(s)')
  .action((ids) => {
    console.log('ID | Date | Concept | Category | Amount');
    console.log('=======================================');
    ids.forEach(id => {
      const filtered = expenses.filter(item => item.id === parseInt(id));
      if (filtered.length === 0) {
        console.log(`⚠️  Item with ID ${id} not found.`);
      } else {
        filtered.forEach(displayExpense);
      }
    });
  });

// Add items
program
  .command('add <concept> <category> <amount>')
  .description('Add a new item')
  .action((concept, category, amount) => {
    const id = expenses.length ? Math.max(...expenses.map(e => e.id)) + 1 : 1;
    const timestamp = Math.floor(Date.now() / 1000);
    const newItem = {
      id,
      timestamp,
      concept,
      category,
      amount: parseFloat(amount),
    };
    expenses.push(newItem);
    fs.writeFileSync('expenses.json', JSON.stringify(expenses, null, 2));
    console.log('Item added:');
    displayExpense(newItem);
  });

// Delete items
program
  .command('delete <ids...>')
  .description('Delete expense(s) by ID')
  .action((ids) => {
    ids.forEach(id => {
      const index = expenses.findIndex(item => item.id === parseInt(id));
      if (index !== -1) {
        console.log('Item to remove:', expenses[index]);
        expenses.splice(index, 1);
        fs.writeFileSync('expenses.json', JSON.stringify(expenses, null, 2));
      } else {
        console.log(`⚠️  Item with ID ${id} not found.`);
      }
    });
  });

// Export
program
  .command('export-file <filenames...>')
  .description('Export expenses to .csv or .txt files')
  .action((filenames) => {
    filenames.forEach(filename => {
      const ext = path.extname(filename).toLowerCase();
      let output = '';

      if (ext === '.csv') {
        output = [
          'id,date,concept,category,amount',
          ...expenses.map(item => {
            const date = new Date(item.timestamp * 1000).toLocaleDateString();
            return `${item.id},${date},${item.concept},${item.category},${item.amount}`;
          })
        ].join('\n');
      } else if (ext === '.txt') {
        output = [
          'ID | Date | Concept | Category | Amount',
          '=======================================',
          ...expenses.map(item => {
            const date = new Date(item.timestamp * 1000).toLocaleDateString();
            return `#${item.id} | ${date} | ${item.concept} | ${item.category} | ${item.amount}€`;
          })
        ].join('\n');
      } else {
        console.log(`❌ Unsupported file format for ${filename}. Use .csv or .txt`);
        return;
      }

      fs.writeFileSync(filename, output);
      console.log(`✅ Exported file to ${filename}`);
    });
  });

program.parse(); // To start all commands.

function displayExpense(item) {
    const unixTimestamp = item.timestamp; //in seconds
    const localDate = new Date(unixTimestamp*1000).toLocaleDateString();
    console.log(`#${item.id} | ${localDate} | ${item.concept} | ${item.category} | ${item.amount}€`);
}