CREATE TABLE "demande_acces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"group_id" uuid NOT NULL,
	"branch_id" uuid NOT NULL,
	"user_id" text,
	"statut" text DEFAULT 'en_attente' NOT NULL,
	"message" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "email_unite" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"branch_id" uuid NOT NULL,
	"email" text NOT NULL,
	"statut" text DEFAULT 'propose' NOT NULL,
	"propose_par" text,
	"valide_par" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "validations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"demande_id" uuid NOT NULL,
	"validateur_user_id" text NOT NULL,
	"decision" text NOT NULL,
	"commentaire" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "demande_acces" ADD CONSTRAINT "demande_acces_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demande_acces" ADD CONSTRAINT "demande_acces_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_unite" ADD CONSTRAINT "email_unite_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "validations" ADD CONSTRAINT "validations_demande_id_demande_acces_id_fk" FOREIGN KEY ("demande_id") REFERENCES "public"."demande_acces"("id") ON DELETE no action ON UPDATE no action;