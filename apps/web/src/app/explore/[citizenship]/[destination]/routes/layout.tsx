/**
 * The Routes section owns a `@modal` parallel slot so a route's detail can open
 * as a peek drawer over the still-mounted comparison list (see the intercepting
 * route at `@modal/(.)[id]`). On a hard load or shared link the slot resolves to
 * `@modal/default` (nothing) and the real `[id]` page renders instead.
 */
export default function RoutesLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
