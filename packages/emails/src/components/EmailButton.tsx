import React from 'react'
import { fontStack, radius, tokens } from '../tokens'

export interface EmailButtonProps {
  href: string
  children: string
}

/**
 * Bulletproof CTA button for email with Outlook VML fallback.
 *
 * Uses dangerouslySetInnerHTML to emit the full VML conditional block required
 * for Outlook Desktop to render padded buttons. CSS padding is ignored by Outlook
 * on <a> tags — the VML path is the only reliable cross-client solution.
 *
 * <!--[if mso]>...<![endif]--> wraps a VML rect/roundrect that Outlook renders.
 * The normal <a> block is hidden from Outlook via <!--[if !mso]><!-->...<![endif]-->
 * so modern clients (Gmail, Apple Mail) use the CSS-styled anchor.
 *
 * className="email-btn" allows Layout's dark-mode <style> block to swap:
 *   - backgroundColor → tokens.dark.accent (#CEFF32)
 *   - color → tokens.dark.textOnAccent (#141414)
 */
export function EmailButton({ href, children }: EmailButtonProps): React.ReactElement {
  const bg = tokens.light.accent
  const textColor = tokens.light.textOnAccent
  const font = fontStack.mono
  const pX = 24
  const pY = 12
  const borderRadius = 6 // pts, approximate for Outlook VML

  const html = `<!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"
  href="${href}" style="height:auto;v-text-anchor:middle;width:200px;" arcsize="50%" strokecolor="${bg}" fillcolor="${bg}">
  <w:anchorlock/>
  <center style="color:${textColor};font-family:${font};font-size:14px;font-weight:700;letter-spacing:0.02em;">${children}</center>
</v:roundrect>
<![endif]--><!--[if !mso]><!-->
<a href="${href}" class="email-btn" style="background-color:${bg};border-radius:${radius.full};color:${textColor};display:inline-block;font-family:${font};font-size:14px;font-weight:700;letter-spacing:0.02em;padding:${pY}px ${pX}px;text-decoration:none;">${children}</a>
<!--<![endif]-->`

  return <div dangerouslySetInnerHTML={{ __html: html }} />
}
