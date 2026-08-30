// Controlled compatibility fault, not a mock of the task board or memory UI.
// Leave the real npm panels intact; drop only an active board's announcement.
window.__ModuleLoader__.load({
  id: 'dsh-mnemon-regression-panel-event-loss',
  factory: () => ({
    apply(ctx) {
      ctx.effect(() => {
        const dropBoardAnnouncement = event => {
          if (event.detail === 'taskboard' && document.documentElement.hasAttribute('data-dsh-taskboard-active')) {
            event.stopImmediatePropagation()
            console.info('[mnemon regression] dropped taskboard activation announcement (controlled fault)')
          }
        }
        document.addEventListener('dsh-panel-activate', dropBoardAnnouncement, true)
        console.info('[mnemon regression] controlled panel-event-loss fixture enabled')
        return () => document.removeEventListener('dsh-panel-activate', dropBoardAnnouncement, true)
      }, 'regression: controlled panel event loss')
    },
  }),
})
