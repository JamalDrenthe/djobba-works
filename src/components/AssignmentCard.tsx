import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, Briefcase, Zap, Building2 } from "lucide-react";

export interface Assignment {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "short" | "long";
  duration: string;
  compensation: string;
  compensationType: "hourly" | "monthly";
  sector: string;
  factoringAvailable?: boolean;
}

interface AssignmentCardProps {
  assignment: Assignment;
}

export function AssignmentCard({ assignment }: AssignmentCardProps) {
  const isShort = assignment.type === "short";

  return (
    <Link to={`/opdracht/${assignment.id}`}>
      <Card className="group hover:shadow-lg transition-all duration-200 border-border bg-card">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge 
                  variant={isShort ? "default" : "secondary"}
                  className={isShort ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}
                >
                  {isShort ? (
                    <>
                      <Zap className="h-3 w-3 mr-1" />
                      KORT
                    </>
                  ) : (
                    <>
                      <Building2 className="h-3 w-3 mr-1" />
                      VAST CONTRACT
                    </>
                  )}
                </Badge>
                <span className="text-xs text-muted-foreground">{assignment.duration}</span>
              </div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {assignment.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{assignment.company}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {assignment.location}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              {assignment.sector}
            </span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div>
              <span className="font-bold text-lg text-foreground">
                {assignment.compensation}
              </span>
              <span className="text-sm text-muted-foreground">
                /{assignment.compensationType === "hourly" ? "uur" : "maand"}
              </span>
            </div>
            {isShort && assignment.factoringAvailable && (
              <Badge variant="outline" className="border-success text-success bg-success/10">
                <Clock className="h-3 w-3 mr-1" />
                Binnen 3 dagen betaald
              </Badge>
            )}
            {!isShort && (
              <Badge variant="outline" className="border-info text-info bg-info/10">
                <Building2 className="h-3 w-3 mr-1" />
                In dienst bij {assignment.company}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
