/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
 import { List, ListItem, Text } from "@chakra-ui/layout";
 import { useIntl } from "react-intl";
 import HeadedScrollablePanel from "../common/HeadedScrollablePanel";
 import AreaHeading from "../common/AreaHeading";
 import CodeEmbed from "./common/CodeEmbed";
 import { Divider } from "@chakra-ui/react";
 
 const SkeletonArea = () => {
   const intl = useIntl();
   return (
     <HeadedScrollablePanel
       heading={
         <AreaHeading
           name={intl.formatMessage({ id: "skeleton-tab-heading" })}
           description={intl.formatMessage({ id: "skeleton-tab-description" })}
         />
       }
     >
       <List flex="1 1 auto" m={3}>
         <ListItem key={"for loop"}>
           <Text  p={5}>
             <CodeEmbed code={"for i in range(0):\n    pass" }/>
           </Text>
           <Divider borderWidth="1px" />
         </ListItem>
         <ListItem key={"while loop"}>
           <Text  p={5}>
             <CodeEmbed code={"while False:\n    pass" }/>
           </Text>
           <Divider borderWidth="1px" />
         </ListItem>
         <ListItem key={"if stmt"}>
           <Text  p={5}>
             <CodeEmbed code={"if False:\n    pass" }/>
           </Text>
           <Divider borderWidth="1px" />
         </ListItem>
         <ListItem key={"ifel stmt"}>
           <Text  p={5}>
             <CodeEmbed code={"if False:\n    pass\nelse:\n    pass" }/>
           </Text>
           <Divider borderWidth="1px" />
         </ListItem>
         <ListItem key={"ifelifel stmt"}>
           <Text  p={5}>
             <CodeEmbed code={"if False:\n    pass\nelif False:\n    pass\nelse:\n    pass" }/>
           </Text>
           <Divider borderWidth="1px"/>
         </ListItem>
       </List>
     </HeadedScrollablePanel>
   );
 };
 
 export default SkeletonArea;
