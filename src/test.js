enyo.kind({
	name: "TestMe",
	kind: "VFlexBox",
	components: [
	             {kind: "PageHeader", name: "fullHeader", style: "background: url('images/header_main.png')"},
	             {kind: enyo.Toolbar, pack: "justify", components: [
	                                                                {kind: enyo.GrabButton}
	                                                            ]}
	]
});