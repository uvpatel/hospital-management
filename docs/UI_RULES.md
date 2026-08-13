# shadcn/ui and UX Rules

## Foundation

Use shadcn/ui primitives as the component base. Do not create duplicate primitive libraries such as custom buttons, dialogs, dropdowns, tabs, tables, sheets, toasts, or form controls when shadcn/ui provides the primitive.

Generated shadcn components live in `components/ui/` and may be adapted consistently to the project design system.

## Layout

Dashboard layout must include:
- Collapsible sidebar.
- Header with breadcrumbs/page title.
- User menu.
- Responsive mobile navigation.
- Main content region with predictable max width/padding.

## Visual Consistency

- Use semantic design tokens instead of arbitrary hard-coded colors.
- Maintain consistent spacing scale.
- Use clear typography hierarchy.
- Use cards only when grouping is meaningful; do not wrap every element in a card.
- Statuses use consistent Badge variants.
- Destructive actions use destructive variant and confirmation dialog.

## Required shadcn/ui Patterns

Use as appropriate:
- `Button`
- `Input`
- `Textarea`
- `Select`
- `Checkbox`
- `RadioGroup`
- `Switch`
- `Form` or current recommended form composition
- `Dialog`
- `AlertDialog`
- `Sheet`
- `DropdownMenu`
- `Popover`
- `Command`
- `Tabs`
- `Table`
- `Badge`
- `Card`
- `Tooltip`
- `Skeleton`
- `Alert`
- `Separator`
- `Breadcrumb`
- `Pagination`/project data-table pagination composition
- Toast/Sonner pattern supported by the installed shadcn setup

## Forms

Every form must:
- Have labels.
- Show field-level validation errors.
- Preserve entered values on validation failure.
- Disable submit while pending.
- Prevent accidental duplicate submission.
- Show server error feedback.
- Show success feedback and navigate/revalidate correctly.
- Use correct input types and autocomplete attributes where applicable.
- Never trust disabled/hidden fields for authorization.

## Data Tables

Every operational list needs:
- Server-backed pagination.
- Search when useful.
- Relevant filters.
- Sort allowlist.
- Loading state.
- Empty state.
- Error state.
- Row action menu only for permitted actions.

Avoid loading the complete database table to the browser and paginating locally.

## Empty States

Empty states must explain what is empty and include a permission-appropriate next action. They must not insert fake rows.

## Loading States

Use skeletons for page/table/detail loading. Keep layout stable to reduce shifting.

## Confirmation Rules

Use `AlertDialog` for:
- Appointment cancellation.
- Invoice voiding.
- User deactivation.
- Sensitive discharge/transfer actions where confirmation is appropriate.
- Any destructive action.

## Accessibility

- Keyboard-accessible navigation and dialogs.
- Visible focus states.
- Correct labels/aria descriptions.
- Do not communicate status using color alone.
- Ensure icon-only buttons have accessible names.
- Tables and forms must remain usable at 200% zoom and narrow widths.

## Responsive Behavior

Desktop-first operational screens still need tablet/mobile usability:
- Tables may switch to scroll/container/card representations where necessary.
- Forms use responsive grids.
- Dialogs that are too large on mobile should use Sheet/fullscreen-friendly composition.

## No Static Data

Charts, KPIs, appointment lists, doctor lists, patient summaries, lab queues, inventory counts, invoice totals, and report rows must come from database queries/API. Demo population belongs to `db/seed.ts`.
