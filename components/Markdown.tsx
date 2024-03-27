"use client"

import Zoom from "react-medium-image-zoom"

import "react-medium-image-zoom/dist/styles.css"
import { AnchorHTMLAttributes, ImgHTMLAttributes } from "react"
import Markdown from "react-markdown"

export function MarkdownClient({ children }: { children: string }) {
  return (
    <Markdown
      className="m-auto max-w-[800px] space-y-4 text-zinc-700 dark:text-zinc-300"
      components={{
        a: (a: AnchorHTMLAttributes<HTMLAnchorElement>) => {
          return (
            <a
              href={a.href}
              rel="noopener noreferrer"
              target="_blank"
              className="text-cosmic-blue"
            >
              {a.children}
            </a>
          )
        },
        img: (image: ImgHTMLAttributes<HTMLImageElement>) => {
          return (
            <Zoom classDialog="custom-zoom">
              {/* eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element */}
              <img loading="lazy" src={image.src} alt={image.alt} />
            </Zoom>
          )
        },
      }}
    >
      {children}
    </Markdown>
  )
}
