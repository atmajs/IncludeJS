import { internalEval } from './eval'
import { refs } from '../global'

refs.evaluate = internalEval;