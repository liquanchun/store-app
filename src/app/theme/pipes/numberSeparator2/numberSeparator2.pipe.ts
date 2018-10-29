import { Pipe, PipeTransform } from "@angular/core";
import * as _ from "lodash";
/*
 * Raise the value exponentially
 * Takes an exponent argument that defaults to 1.
 * Usage:
 *   value | exponentialStrength:exponent
 * Example:
 *   {{ 2 | exponentialStrength:10 }}
 *   formats to: 1024
*/
@Pipe({ name: "numberSeparator2" })
export class NumberSeparatorPipe2 implements PipeTransform {
  transform(value: number): string {
    if (_.isNumber(value)) {
      const val = ("" + value).replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g, "$1,");
      return val;
    } else {
      return value;
    }
  }
}
