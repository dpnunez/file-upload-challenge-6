import csvParse from 'csv-parse';
import csv from 'csv-parser';
import fs from 'fs';

export default function loadCSV(filePath: string): Promise<any[]> {
  return new Promise(resolve => {
    const storage: any[] = [];
    fs.createReadStream(filePath, 'utf8')
      .pipe(
        csv({
          mapHeaders: ({ header }) => header.replace(' ', ''),
          mapValues: ({ value }) => value.replace(' ', ''),
        }),
      )
      .on('data', async data => storage.push(data))
      .on('end', () => {
        resolve(storage);
      });
  });
}
