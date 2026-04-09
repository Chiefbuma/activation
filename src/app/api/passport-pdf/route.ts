import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PUPPETEER_RUNTIME_PATH =
  process.env.PUPPETEER_RUNTIME_PATH || '/tmp/taria-pdf-runtime/node_modules/puppeteer';
const PUPPETEER_CACHE_DIR = process.env.PUPPETEER_CACHE_DIR || '/tmp/taria-pdf-runtime/.cache';
const PUPPETEER_USER_DATA_DIR =
  process.env.PUPPETEER_USER_DATA_DIR || '/tmp/taria-pdf-runtime/.profile';
const EXECUTABLE_NAMES = new Set(['chrome', 'chrome-headless-shell']);

type PuppeteerModule = {
  launch: (options: Record<string, unknown>) => Promise<{
    newPage: () => Promise<{
      setViewport: (options: Record<string, number>) => Promise<void>;
      goto: (url: string, options: Record<string, unknown>) => Promise<unknown>;
      emulateMediaType: (type: 'screen' | 'print' | null) => Promise<void>;
      waitForFunction: (fn: string | (() => unknown), options?: Record<string, unknown>) => Promise<unknown>;
      waitForSelector: (selector: string, options?: Record<string, unknown>) => Promise<unknown>;
      pdf: (options: Record<string, unknown>) => Promise<Uint8Array>;
      close: () => Promise<void>;
    }>;
    close: () => Promise<void>;
  }>;
};

async function findExecutable(root: string, depth = 0): Promise<string | null> {
  if (!existsSync(root) || depth > 6) {
    return null;
  }

  const entries = await readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(root, entry.name);

    if (entry.isFile() && EXECUTABLE_NAMES.has(entry.name)) {
      return fullPath;
    }

    if (entry.isDirectory()) {
      const match = await findExecutable(fullPath, depth + 1);
      if (match) {
        return match;
      }
    }
  }

  return null;
}

async function getPuppeteer(): Promise<PuppeteerModule> {
  const specifier = PUPPETEER_RUNTIME_PATH.startsWith('.')
    ? pathToFileURL(join(process.cwd(), PUPPETEER_RUNTIME_PATH)).href
    : PUPPETEER_RUNTIME_PATH.startsWith('/')
      ? pathToFileURL(PUPPETEER_RUNTIME_PATH).href
      : PUPPETEER_RUNTIME_PATH;

  const module = (await import(/* webpackIgnore: true */ specifier)) as {
    default?: PuppeteerModule;
  } & PuppeteerModule;

  return module.default ?? module;
}

async function buildPassportPdf(renderUrl: string) {
  const puppeteer = await getPuppeteer();
  const executablePath = await findExecutable(PUPPETEER_CACHE_DIR);

  if (!executablePath) {
    throw new Error('Passport PDF browser runtime is not installed yet.');
  }

  const previousTmpDir = process.env.TMPDIR;
  process.env.TMPDIR = '/tmp';

  const browser = await puppeteer.launch({
    headless: true,
    executablePath,
    userDataDir: PUPPETEER_USER_DATA_DIR,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=medium'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 2200, deviceScaleFactor: 1 });
    await page.goto(renderUrl, { waitUntil: 'networkidle0', timeout: 120000 });
    await page.emulateMediaType('screen');
    await page.waitForSelector('[data-passport-print-root="true"]', { timeout: 120000 });
    await page.waitForFunction(
      () =>
        document.fonts.status === 'loaded' &&
        document.querySelectorAll('[data-passport-print-section="true"]').length > 0,
      { timeout: 120000 }
    );
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '12mm',
        right: '12mm',
        bottom: '12mm',
        left: '12mm',
      },
      preferCSSPageSize: true,
    });
  } finally {
    process.env.TMPDIR = previousTmpDir;
    await browser.close();
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const corporateId = url.searchParams.get('corporateId') || 'all';
    const slug = url.searchParams.get('slug') || 'aggregate';
    const renderUrl = new URL('/passport-print', request.url);
    renderUrl.searchParams.set('corporateId', corporateId);

    const pdf = await buildPassportPdf(renderUrl.toString());

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="taria-passport-${slug}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate Passport PDF.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
