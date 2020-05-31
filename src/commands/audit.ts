import { OwnershipEngine } from '../lib/OwnershipEngine';
import { OwnedFile } from '../lib/OwnedFile';
import { getFilteredFilePaths } from '../lib/dir';
import { OUTPUT_FORMAT } from '../lib/types';
import { calcFileStats } from '../lib/stats';
import { writeOwnedFile, writeStats } from '../lib/writers';

interface AuditOptions {
  codeowners: string;
  dir: string;
  unloved: boolean;
  output: OUTPUT_FORMAT;
  stats: boolean;
  root: string;
}

export const audit = async (options: AuditOptions) => {
  const files = await getFilesWithOwnership(options);

  if (options.stats) {
    const stats = calcFileStats(files);
    writeStats(stats, options, process.stdout);
    return;
  }

  for (const file of files) {
    if (options.unloved && file.owners.length < 1) {
      return;
    }

    writeOwnedFile(file, options, process.stdout);
  }
};

const getFilesWithOwnership = async (options: AuditOptions): Promise<OwnedFile[]> => {
  const engine = OwnershipEngine.FromCodeownersFile(options.codeowners);
  const filePaths = await getFilteredFilePaths(options.dir, options.root);

  const files: OwnedFile[] = [];

  for (const filePath of filePaths) {
    files.push(await OwnedFile.FromPath(filePath, engine));
  }

  return files;
};