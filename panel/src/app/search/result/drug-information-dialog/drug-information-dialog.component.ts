import { CommonModule } from '@angular/common';
import { Component, Inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { SHARED } from '../../../shared';
import { DrugInformationResult } from '../drug-information-panel/drug-information.types';

@Component({
  selector: 'app-drug-information-dialog',
  standalone: true,
  imports: [CommonModule, SHARED, MatDialogModule],
  templateUrl: './drug-information-dialog.component.html',
  styleUrl: './drug-information-dialog.component.scss',
})
export class DrugInformationDialogComponent {
  bodyHtml: string | null;
  sections: { id: string; title: string }[] = [];
  isMobile = signal(false);
  mobileView = signal<'outline' | 'content'>('content');

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { drug: DrugInformationResult },
  ) {
    const bodyHtml = this.resolveBodyHtml(this.data.drug.content);
    const processed = this.prepareHtmlForDisplay(bodyHtml);
    this.bodyHtml = processed.html;
    this.sections = processed.sections;

    const mobile = window.matchMedia('(max-width: 1024px)').matches;
    this.isMobile.set(mobile);
    if (mobile && this.sections.length) {
      this.mobileView.set('outline');
    }
  }

  private isObject(value: unknown): value is Record<string, unknown> {
    return !!value && typeof value === 'object' && !Array.isArray(value);
  }

  private asRecord(value: unknown): Record<string, unknown> | null {
    return this.isObject(value) ? value : null;
  }

  private asString(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const normalized = value.trim();
    return normalized || null;
  }

  private findHtmlField(
    root: Record<string, unknown>,
    candidates: string[],
  ): string | null {
    const normalizedCandidates = candidates.map((x) => x.toLowerCase());
    const entries = Object.entries(root);

    for (const [key, value] of entries) {
      if (!normalizedCandidates.includes(key.toLowerCase())) continue;
      const html = this.asString(value);
      if (html) return html;
    }

    for (const [key, value] of entries) {
      const normalizedKey = key.toLowerCase();
      if (!normalizedCandidates.some((candidate) => normalizedKey.includes(candidate))) {
        continue;
      }
      const html = this.asString(value);
      if (html) return html;
    }

    return null;
  }

  private resolveBodyHtml(content: unknown): string | null {
    const root = this.asRecord(content);
    if (!root) return null;
    const topicInfo = this.asRecord(root['topicInfo']);
    return (
      this.findHtmlField(root, ['bodyHtml']) ||
      this.findHtmlField(topicInfo || {}, ['bodyHtml'])
    );
  }

  private stripLinksFromHtml(html: string | null): string | null {
    if (!html) return null;
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const anchors = Array.from(doc.querySelectorAll('a'));

    for (const anchor of anchors) {
      const replacement = doc.createElement('span');
      replacement.innerHTML = anchor.innerHTML;
      anchor.replaceWith(replacement);
    }

    return doc.body.innerHTML;
  }

  private prepareHtmlForDisplay(html: string | null): {
    html: string | null;
    sections: { id: string; title: string }[];
  } {
    const cleaned = this.stripLinksFromHtml(html);
    if (!cleaned) return { html: null, sections: [] };

    const parser = new DOMParser();
    const doc = parser.parseFromString(cleaned, 'text/html');
    const headingNodes = Array.from(doc.querySelectorAll('.drugH1, h1, h2'));
    const sections: { id: string; title: string }[] = [];

    headingNodes.forEach((heading, index) => {
      const title = heading.textContent?.trim();
      if (!title) return;

      const id = `drug-section-${index + 1}`;
      heading.setAttribute('id', id);
      sections.push({ id, title });
    });

    return {
      html: doc.body.innerHTML,
      sections: sections.slice(0, 40),
    };
  }

  scrollToSection(id: string) {
    if (this.isMobile()) {
      this.mobileView.set('content');
      setTimeout(() => {
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
      return;
    }

    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  goToOutline() {
    this.mobileView.set('outline');
  }
}
