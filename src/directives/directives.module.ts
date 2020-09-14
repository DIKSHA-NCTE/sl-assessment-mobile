import { NgModule } from '@angular/core';
import { SwitchTemplateDirective } from './switch-template/switch-template';
import { ImageResolverDirective } from './image-resolver/image-resolver';
import { BgDynamicColorDirective } from './bg-dynamic-color/bg-dynamic-color';
@NgModule({
	declarations: [SwitchTemplateDirective,
    ImageResolverDirective,
    BgDynamicColorDirective],
	imports: [],
	exports: [SwitchTemplateDirective,
    ImageResolverDirective,
    BgDynamicColorDirective]
})
export class DirectivesModule {}
