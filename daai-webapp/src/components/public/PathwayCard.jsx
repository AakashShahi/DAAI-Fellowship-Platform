import Badge from '../ui/Badge'
import Button from '../ui/Button'
import Card from '../ui/Card'

export default function PathwayCard({ pathway }) {
  return (
    <Card className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-bold text-slate-900">{pathway.title}</h3>
        {pathway.comingSoon ? <Badge tone="warning">Coming soon</Badge> : null}
      </div>
      <p className="mt-3 flex-1 text-sm text-slate-600">{pathway.shortDescription}</p>
      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-500">
        Skills
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {pathway.skills.slice(0, 5).map((skill) => (
          <Badge key={skill} tone="primary">
            {skill}
          </Badge>
        ))}
      </div>
      <p className="mt-4 text-xs text-slate-500">Duration: {pathway.duration}</p>
      <div className="mt-5">
        {pathway.comingSoon ? (
          <Button variant="secondary" className="pointer-events-none opacity-60" disabled>
            Coming soon
          </Button>
        ) : (
          <Button to={`/fellowship/${pathway.slug}`} variant="secondary">
            View pathway
          </Button>
        )}
      </div>
    </Card>
  )
}
