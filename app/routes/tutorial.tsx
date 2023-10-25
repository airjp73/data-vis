import { LayoutGroup, motion } from "framer-motion";
import type { PropsWithChildren, ReactElement, RefObject } from "react";
import {
  Children,
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import invariant from "tiny-invariant";

type TutorialProps = PropsWithChildren<{
  id: string;
  name: string;
}>;
const TutorialContext = createContext<null | {
  id: string;
  name: string;
  currentStep: number;
  onNextClick: () => void;
  onBackClick: () => void;
}>(null);

const Tutorial = ({ name, id, children }: TutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const value = useMemo(
    () => ({
      name,
      id,
      currentStep,
      onNextClick: () => setCurrentStep(currentStep + 1),
      onBackClick: () => setCurrentStep(currentStep - 1),
    }),
    [currentStep, id, name]
  );

  return (
    <TutorialContext.Provider value={value}>
      <LayoutGroup>{children}</LayoutGroup>
    </TutorialContext.Provider>
  );
};

const useRect = (ref: RefObject<HTMLElement>) => {
  const [rect, setRect] = useState(null as null | DOMRect);
  useEffect(() => {
    // For demo purposes only. Doesn't really cut it
    setRect(ref.current?.getBoundingClientRect() ?? null);
  }, [ref]);
  return rect;
};

type TutorialItemProps = PropsWithChildren<{
  title: string;
  step: number;
  content: string;
}>;
const TutorialItem = ({
  step,
  title,
  content,
  children,
}: TutorialItemProps) => {
  const context = useContext(TutorialContext);
  invariant(context);
  const elRef = useRef<HTMLElement>(null);
  const rect = useRect(elRef);

  const child = Children.only(children);
  return (
    <>
      {cloneElement(child as ReactElement<any>, { ref: elRef })}

      {!!rect && context.currentStep === step && (
        <motion.div
          layoutId={`tutorial-${context.id}`}
          style={{
            backgroundColor: "#34d399",
            borderRadius: 5,
            border: "1px solid #059669",
            position: "fixed",
            left: (rect?.left ?? 0) - 10,
            top: (rect?.top ?? 0) - 10,
            opacity: 0.95,
            boxShadow: "0 5px 5px 1px #059669",
            padding: "1rem",
            overflow: "hidden",
          }}
        >
          <motion.div layout="position">
            <h4>
              {context.name} - {title}
            </h4>
            <p>{content}</p>
            <div style={{ display: "flex" }}>
              <button
                onClick={() => context.onBackClick()}
                style={{ marginRight: "1rem" }}
              >
                Back
              </button>
              <button onClick={() => context.onNextClick()}>Next</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default function TutorialDemo() {
  return (
    <Tutorial id="tutorial" name="Tutorial">
      <div
        style={{
          maxWidth: 600,
          margin: "0 auto",
        }}
      >
        <h1 style={{ textAlign: "center" }}>Tutorial</h1>
        <TutorialItem
          title="First step"
          step={0}
          content="This is a decent paragraph"
        >
          <p>
            Tristique orci dignissim montes, hac netus risus dis sit per
            vehicula cursus. Vivamus lorem suspendisse imperdiet proin orci mus
            rhoncus maecenas eu. In penatibus ornare turpis dictumst mauris
            maecenas adipiscing sed nulla. Molestie donec fringilla rutrum
            porttitor magnis maecenas. Duis phasellus cursus habitant sociis
            eros aenean massa aliquam sollicitudin eleifend suscipit.
            Condimentum pulvinar massa ipsum ridiculus habitant nibh est mollis
            cursus ornare duis. Habitasse aptent quis faucibus ligula nulla
            viverra fermentum volutpat. Metus mollis imperdiet malesuada.
            Fermentum etiam adipiscing vel.
          </p>
        </TutorialItem>
        <ul>
          <li>
            Penatibus per nisi mattis hendrerit inceptos dolor facilisis tellus
            sed?
          </li>
          <li>
            Placerat massa molestie nullam cras sociis scelerisque magna
            habitant enim.
          </li>
          <TutorialItem title="Second step" step={1} content="This is a list">
            <li>
              Dolor tortor cursus dolor egestas habitant est eu condimentum
              auctor.
            </li>
          </TutorialItem>
          <li>
            Imperdiet adipiscing sit ipsum amet at mus ullamcorper tellus
            ultricies.
          </li>
          <li>
            Lorem ridiculus phasellus metus sapien sagittis venenatis curabitur
            vitae penatibus.
          </li>
        </ul>
        <TutorialItem
          title="Last step"
          step={2}
          content="Something, something, something, darkside"
        >
          <p>
            Nisl penatibus senectus ultricies accumsan convallis. Tempor luctus
            euismod, aenean eu vulputate? Dui, pretium odio urna. Porttitor
            inceptos et bibendum at nascetur potenti eleifend risus quisque.
            Vehicula pretium ultrices facilisis pellentesque dictum. Velit magna
            vulputate et mus natoque taciti. Maecenas ipsum ipsum praesent
            ullamcorper sodales duis nisi ac et phasellus?
          </p>
        </TutorialItem>
        <p>
          Lectus pretium mauris metus euismod eleifend posuere montes libero
          placerat mauris lacinia. Luctus vivamus interdum fames imperdiet hac
          egestas consectetur, class dapibus cubilia nisl. Risus quam morbi
          inceptos interdum dictumst proin. Maecenas mollis magnis morbi
          vehicula convallis praesent integer hac leo, nec hendrerit sociosqu?
          Nullam rhoncus litora nam. Non cursus porttitor integer quam mi sem
          egestas sociis. Bibendum vehicula blandit.
        </p>
        <p>
          Cursus sit magnis varius! Potenti molestie pharetra praesent molestie
          ut eleifend ante turpis eu porttitor viverra orci. Diam hendrerit
          gravida egestas molestie vivamus! Natoque elementum lobortis fusce
          suscipit fames erat semper. Massa condimentum vulputate lorem
          habitasse hendrerit viverra, aptent duis. Auctor urna quam imperdiet
          suscipit! Sociosqu laoreet sapien venenatis himenaeos nisi commodo
          nisi magnis pulvinar euismod viverra auctor? Congue sociosqu,
          hendrerit himenaeos convallis consectetur. Ullamcorper lectus
          elementum, id felis tempor mollis consequat. Potenti, felis volutpat
          cum semper fames elementum elit. Dui class consectetur gravida iaculis
          pretium pretium inceptos tellus turpis! Euismod at ornare praesent
          mattis scelerisque parturient.
        </p>
        <p>
          Feugiat at quis et vulputate viverra per eros maecenas per placerat.
          Dignissim porttitor sit felis sed nibh cum sociosqu malesuada mauris
          placerat elementum enim. Blandit cubilia velit eget aenean tincidunt
          lorem laoreet? Phasellus dictum tincidunt primis est proin phasellus
          faucibus commodo a turpis. Porta natoque euismod magna odio nibh.
          Lobortis justo molestie dictumst id ad tortor viverra magnis
          tristique.
        </p>
      </div>
    </Tutorial>
  );
}
