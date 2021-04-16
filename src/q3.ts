import {isEmpty, map} from "ramda";
import { makeSymbolSExp } from "../imp/L3-value";
import { rest } from "../shared/list";
import { makeFailure, makeOk, Result } from "../shared/result";
import { Binding, CExp, ClassExp, Exp, isAppExp, isAtomicExp, isBoolExp, isCExp, isClassExp, isDefineExp, isExp, isIfExp, isLetExp, isLitExp, isNumExp, isProcExp, isProgram, isStrExp, makeAppExp, makeBoolExp, makeDefineExp, makeIfExp, makeLetExp, makeLitExp, makePrimOp, makeProcExp, makeProgram, makeVarDecl, makeVarRef, ProcExp, Program, VarDecl } from "./L31-ast";

/*
Purpose: Transform ClassExp to ProcExp
Signature: for2proc(classExp)
Type: ClassExp => ProcExp
*/
export const class2proc = (exp: ClassExp): ProcExp => {

const field: VarDecl[]= exp.fields;
const exps: ProcExp[]= [makeProcExp([makeVarDecl("msg")],[toCexp(exp.methods)])]
return makeProcExp(field, exps);
}
export const toCexp = (binds: Binding[]): CExp =>{
 return isEmpty(binds)?makeBoolExp(false) :
         makeIfExp(makeAppExp(makePrimOp("eq?"),[makeVarRef("msg"),makeLitExp(makeSymbolSExp(binds[0].var.var))]),
         makeAppExp(binds[0].val,[]),toCexp(rest(binds)));
} 
/*
Purpose: Transform L31 AST to L3 AST
Signature: l31ToL3(l31AST) 
Type: [Exp | Program] => Result<Exp | Program>
*/

export const L31ToL3 = (exp: Exp | Program): Result<Exp | Program> =>{

    return isExp(exp) ? makeOk(rewriteAllClassExp(exp)) :
        isProgram(exp) ? makeOk(makeProgram(map(rewriteAllClassExp, exp.exps))) :
        makeFailure("Could not parse L31 to L3");
}
   

const rewriteAllClassExp = (epr: Exp): Exp =>
    isCExp(epr) ? rewriteAllCExp(epr) :
    isDefineExp(epr) ?makeDefineExp(epr.var,rewriteAllCExp(epr.val)):
    epr;

const rewriteAllCExp = (epr: CExp): CExp =>
    isAtomicExp(epr) ? epr :
    isLitExp(epr) ? epr :
    isBoolExp(epr)? epr:
    isNumExp(epr)? epr:
    isStrExp(epr)? epr:
    isIfExp(epr) ? makeIfExp(rewriteAllCExp(epr.test),
                            rewriteAllCExp(epr.then),
                             rewriteAllCExp(epr.alt)) :
    isAppExp(epr) ? makeAppExp(rewriteAllCExp(epr.rator),
                               map(rewriteAllCExp, epr.rands)) :
    isProcExp(epr) ? makeProcExp(epr.args, map(rewriteAllCExp, epr.body)) :
    isLetExp(epr)? makeLetExp(epr.bindings,map(rewriteAllCExp,epr.body)):
    isClassExp(epr) ? rewriteAllCExp(class2proc(epr)) :
    epr;  
