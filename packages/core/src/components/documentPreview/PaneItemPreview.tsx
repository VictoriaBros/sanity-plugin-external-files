// Adapted from:
// https://github.com/sanity-io/sanity/blob/next/packages/sanity/src/desk/components/paneItem/PaneItemPreview.tsx
import { PreviewValue } from '@sanity/types'
import { Inline } from '@sanity/ui'
import { isNumber, isString } from 'lodash'
import React, { isValidElement, useMemo } from 'react'
import { useObservable } from 'react-rx'
import type { Observable } from 'rxjs'
import type { SanityDocument, SchemaType } from 'sanity'
import {
  DocumentPresence,
  DocumentPreviewPresence,
  DocumentPreviewStore,
  GeneralPreviewLayoutKey,
  SanityDefaultPreview,
  getPreviewStateObservable,
  getPreviewValueWithFallback,
  isRecord,
} from 'sanity'
import { DraftStatus } from './DraftStatus'
import { PublishedStatus } from './PublishedStatus'

export interface PaneItemPreviewState {
  isLoading?: boolean
  draft?: PreviewValue | Partial<SanityDocument> | null
  published?: PreviewValue | Partial<SanityDocument> | null
}

export interface PaneItemPreviewProps {
  documentPreviewStore: DocumentPreviewStore
  icon: React.ComponentType | false
  layout: GeneralPreviewLayoutKey
  presence?: DocumentPresence[]
  schemaType: SchemaType
  value: SanityDocument
}

export function PaneItemPreview(props: PaneItemPreviewProps) {
  const { icon, layout, presence, schemaType, value } = props
  const title =
    (isRecord(value.title) && isValidElement(value.title)) ||
    isString(value.title) ||
    isNumber(value.title)
      ? (value.title as string | number | React.ReactElement)
      : null

  // NOTE: this emits sync so can never be null
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const previewObservable = useMemo<Observable<PaneItemPreviewState>>(
    () =>
      getPreviewStateObservable(
        props.documentPreviewStore,
        schemaType,
        value._id,
      ) as any,
    [props.documentPreviewStore, schemaType, value._id, title],
  )!
  const { draft, published, isLoading } = useObservable(previewObservable) || {}

  const status = isLoading ? null : (
    <Inline space={4}>
      {presence && presence.length > 0 && (
        <DocumentPreviewPresence presence={presence} />
      )}
      <PublishedStatus document={published} />
      <DraftStatus document={draft} />
    </Inline>
  )

  return (
    <SanityDefaultPreview
      {...(getPreviewValueWithFallback({
        original: { title }
      }) as any)}
      isPlaceholder={isLoading}
      icon={icon}
      layout={layout}
      status={status}
    />
  )
}
