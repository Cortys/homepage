import projectsRaw from "./projects.pug";

function parseProject(projectRaw) {
	const res = projectRaw.match(/^(.*){content}<link name="bannerImgPath" href="(.*?)"><link name="mainImgPath" href="(.*?)"><div name="description">([^]*)<\/div>$/m);

	if(!res)
		return;

	const [, metaRaw, bannerImgPath, mainImgPath, description] = res;

	return {
		...JSON.parse(metaRaw),
		bannerImgPath: bannerImgPath || undefined,
		mainImgPath: mainImgPath || undefined,
		description
	};
}

export const projectsArray = projectsRaw.split("{project}").map(parseProject).filter(p => p != null);
export const projects = new Map();

for(const project of projectsArray)
	projects.set(project.id, project);
