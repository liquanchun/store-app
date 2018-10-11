import { Pipe, PipeTransform } from '@angular/core';
/*
 * Raise the value exponentially
 * Takes an exponent argument that defaults to 1.
 * Usage:
 *   value | exponentialStrength:exponent
 * Example:
 *   {{ 2 | exponentialStrength:10 }}
 *   formats to: 1024
*/
@Pipe({ name: 'numberSeparator' })
export class NumberSeparatorPipe implements PipeTransform {
    transform(value: number): string {
        if (isNaN(value)) {
            return value + '';
        }
        const val = ("" + value).replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g, "$1,");
        return '￥' + val;
    }
}