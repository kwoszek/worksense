import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import DefaultLayout from "@/layouts/default";
import Article from "@/components/article";

export default function ArticlesPage() {

  const articles = [
  { tittle: "How to Prevent and Overcome Burnout (APS)", summary: "Guidelines on preventing burnout through self-care and reflection.", href: "https://psychology.org.au/getmedia/85f586e3-a856-47f2-a306-d0568e318193/aps-burnout-community-resource.pdf" },
  { tittle: "Job Burnout: How to Spot It and Take Action", summary: "Mayo Clinic guide explaining symptoms of burnout and what to do next.", href: "https://www.mayoclinic.org/healthy-lifestyle/adult-health/in-depth/burnout/art-20046642" },
  { tittle: "Preventing Burnout: Protecting Your Well-Being", summary: "APA strategies to avoid burnout.", href: "https://www.psychiatry.org/news-room/apa-blogs/preventing-burnout-protecting-your-well-being" },
  { tittle: "Breaking Down Burnout in the Workplace", summary: "Mayo Clinic analysis of workplace burnout and solutions.", href: "https://mcpress.mayoclinic.org/mental-health/breaking-down-burnout-in-the-workplace/" },
  { tittle: "Burnout Prevention & Recovery", summary: "HelpGuide’s burnout recognition and recovery model.", href: "https://www.helpguide.org/mental-health/stress/burnout-prevention-and-recovery" },
  { tittle: "Burnout and the Brain", summary: "Explores neuroscience behind burnout.", href: "https://www.psychologicalscience.org/observer/burnout-and-the-brain" },
  { tittle: "Tips to Keep Burnout at Bay", summary: "Daily habits to reduce burnout risk.", href: "https://www.mayoclinichealthsystem.org/hometown-health/speaking-of-health/5-tips-to-keep-burnout-at-bay" },
  { tittle: "Burnout — Psychology Today", summary: "Overview of burnout and coping methods.", href: "https://www.psychologytoday.com/us/basics/burnout" },
  { tittle: "12 Ways to Recover From Burnout", summary: "Cleveland Clinic’s recovery tips.", href: "https://health.clevelandclinic.org/how-to-recover-from-burnout" },
  { tittle: "Plan to Prevent Physician Burnout", summary: "Mayo Clinic's plan to reduce burnout in healthcare.", href: "https://www.safetyandhealthmagazine.com/articles/15002-mayo-clinic-publishes-plan-to-help-prevent-physician-burnout" },
  { tittle: "What to Do If You Are Experiencing Burnout", summary: "Immediate steps for dealing with burnout.", href: "https://www.verywellmind.com/what-to-do-if-you-are-experiencing-burnout-5216152" },
  { tittle: "Burnout Recovery — Verywell Mind", summary: "Long-term burnout recovery strategies.", href: "https://www.verywellmind.com/burnout-recovery-and-prevention-6753704" },
  { tittle: "Exercise That Helps Reduce Burnout", summary: "Research showing moderate exercise reduces burnout.", href: "https://www.health.com/moderate-exercise-may-reduce-job-burnout-8676128" },
  { tittle: "How to Bounce Back From Burnout", summary: "Lifestyle-focused burnout recovery explained.", href: "https://www.vogue.com/article/burnout-recovery" }
];

  return (
    <DefaultLayout>
      
     <Card className="w-8/10 m-auto">
      <CardHeader>
        <h2 className="text-5xl opacity-60">Articles Page</h2>
      </CardHeader>
     <Divider/>
      <CardBody>{
        articles.map(a => (
        <Article tittle={a.tittle} summary={a.summary} href={a.href} />
        ))}
        </CardBody>
     </Card>
    </DefaultLayout>
  );
}
