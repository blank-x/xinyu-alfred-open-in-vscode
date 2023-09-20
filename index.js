import alfy from "alfy";
import path from "path";
import glob from "fast-glob";

const wds = !!process.env?.alfred_vscode_wd ? process.env?.alfred_vscode_wd.split(",")	: [];

const formatOutput = ({name, path}) => {
	return {
		title: name,
		uid: path,
		subtitle: path,
		arg: path,
		autocomplete: name,
		"type": "file:skipcheck"
	};
}



const projectCache = alfy.cache.get('projectCache');

let parsedCache = projectCache ? JSON.parse(projectCache) : ['process.env.HOME'];
if(parsedCache.length){
	glob.async(wds, {
		cwd: "/",
		onlyDirectories: true,
		dot: true,
	}).then((d) => {
		d = d || [];
		d = d.map((item) => {
			const name = path.basename(item);
			return {
				name,
				path: item,
			}
		});
		alfy.cache.set('projectCache', JSON.stringify(d));
	})
} else {
	let d = glob.sync(wds, {
		cwd: "/",
		onlyDirectories: true,
		dot: true,
	}) || []
	parsedCache = d.map((item) => {
		return {
			name: path.basename(item),
			path: item,
		}
	});
	alfy.cache.set('projectCache', JSON.stringify(parsedCache));
}

const input = alfy.input || '';

const filtered = parsedCache
										.filter(item=>item?.name?.includes(input))
										.map((item=>{

											return {
												...item,
												 index: item?.name?.indexOf(input)
												}
										}))
										.sort((a, b)=>{
											return b.index - a.index
										}).map(formatOutput);

if(wds.length === 0){
  alfy.output([{
    title: '请先配置环境变量 【alfred_vscode_wd】',
  }]);
} else {
  alfy.output(filtered);
}


