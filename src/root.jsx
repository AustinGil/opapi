// @refresh reload
import { Suspense } from 'solid-js';
import {
  A,
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Meta,
  Routes,
  Scripts,
  Title,
} from 'solid-start';
import './root.css';
import { SvgDefs } from './components/Svg';

export default function Root() {
  return (
    <Html lang="en">
      <Head>
        <Title>SolidStart - Bare</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Body>
        <Suspense>
          <ErrorBoundary>
            <div class="flex gap-4 px-4">
              <A href="/">Index</A>
              <A href="/transcribe">Transcribe</A>
              <A href="/alignment">Alignment</A>
              <A href="/versus">Versus</A>
            </div>
            <div class="max-w-4xl mx-auto xl p-4">
              <Routes>
                <FileRoutes />
              </Routes>
            </div>
          </ErrorBoundary>
          <footer class="my-10 sm:mt-20 px-4 text-center">
            <p>
              Built by <a href="https://austingil.com">Austin Gil</a>. Powered
              by <a href="https://www.akamai.com/">Akamai Connected Cloud</a>.
            </p>
            <p>
              <a href="https://linode.com/austingil">
                Get $100 in free cloud computing credits.
              </a>
            </p>
          </footer>
          <SvgDefs />
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  );
}
