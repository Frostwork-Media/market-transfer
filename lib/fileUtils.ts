import fs from 'fs';
import path from 'path';

export const writeJSONToFile = (data: any, filename: string) => {
    const json = JSON.stringify(data);
    fs.writeFileSync(path.resolve(filename), json);
}

export const readJSONFromFile = (filename: string): any => {
    const json = fs.readFileSync(path.resolve(filename), 'utf-8');
    return JSON.parse(json);
}